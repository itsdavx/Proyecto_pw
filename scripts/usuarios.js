/* ============================================================
   USUARIOS.JS — Gestión de usuarios (lista, crear, editar)
   ============================================================ */

/* ── Lista de usuarios ───────────────────────────────────────── */
async function iniciarListaUsuarios() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('usuarios', 'leer')) return;

    if (!Sesion.tienePermiso('usuarios', 'crear')) {
        document.getElementById('btnNuevoUsuario')?.classList.add('d-none');
    }

    await cargarUsuarios();

    document.getElementById('btnNuevoUsuario')?.addEventListener('click', () => {
        Router.irA(RUTAS.usuariosCrear);
    });
    document.getElementById('txtBuscar')?.addEventListener('input', aplicarFiltros);
    document.getElementById('selFiltroRol')?.addEventListener('change', aplicarFiltros);
    document.getElementById('selFiltroEstado')?.addEventListener('change', aplicarFiltros);
}

async function cargarUsuarios() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.usuarios.listar, { token: Sesion.token() });
        mostrarCargando(false);
        if (r.ok) renderizarTablaUsuarios(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar usuarios.', 'error');
    }
}

function renderizarTablaUsuarios(lista) {
    const tbody = document.getElementById('tbodyUsuarios');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">No hay usuarios registrados.</td></tr>`;
        return;
    }

    const puedeEditar  = Sesion.tienePermiso('usuarios', 'editar');
    const puedeEstado  = Sesion.tienePermiso('usuarios', 'desactivar');

    tbody.innerHTML = lista.map(u => `
        <tr data-buscar="${esc(u.username)} ${esc(u.nombre)} ${esc(u.email)} ${esc(u.rol)}"
            data-rol="${esc(u.id_rol)}" data-estado="${u.estado == 1 ? 1 : 0}">
            <td class="col-num"></td>
            <td>${esc(u.id_user)}</td>
            <td>
                <strong>${esc(u.nombre)}</strong>
                <div class="text-muted" style="font-size:.8rem">${esc(u.username)}</div>
            </td>
            <td>${esc(u.email)}</td>
            <td><span class="badge badge-primary">${esc(u.rol)}</span></td>
            <td>
                <span class="badge ${u.estado == 1 ? 'badge-activo' : 'badge-inactivo'}">
                    ${u.estado == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    ${puedeEditar ? `<button class="btn btn-sm btn-outline" onclick="irEditar(${u.id_user})">Editar</button>` : ''}
                    ${puedeEstado && u.id_user != 1 ? `
                        <button class="btn btn-sm ${u.estado == 1 ? 'btn-warning' : 'btn-success'}"
                            onclick="toggleEstado(${u.id_user}, ${u.estado})">
                            ${u.estado == 1 ? 'Desactivar' : 'Activar'}
                        </button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    poblarFiltroRoles(lista);
    aplicarFiltros();
}

/* Opciones del filtro de rol a partir de los roles presentes en la lista */
function poblarFiltroRoles(lista) {
    const sel = document.getElementById('selFiltroRol');
    if (!sel) return;
    const actual = sel.value;
    const roles  = new Map();
    lista.forEach(u => roles.set(String(u.id_rol), u.rol));
    sel.innerHTML = '<option value="">Todos los roles</option>' +
        [...roles.entries()].map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
    sel.value = actual;
    if (sel.value !== actual) sel.value = '';
}

/* Filtros combinables: búsqueda + rol + estado */
function aplicarFiltros() {
    const q   = (document.getElementById('txtBuscar')?.value || '').toLowerCase();
    const rol = document.getElementById('selFiltroRol')?.value || '';
    const est = document.getElementById('selFiltroEstado')?.value ?? '';
    document.querySelectorAll('#tbodyUsuarios tr[data-buscar]').forEach(tr => {
        const coincide = tr.dataset.buscar.toLowerCase().includes(q)
            && (!rol || tr.dataset.rol === rol)
            && (est === '' || tr.dataset.estado === est);
        tr.style.display = coincide ? '' : 'none';
    });
    renumerarFilas(document.getElementById('tbodyUsuarios'));
}

function irEditar(id) {
    Router.irA(`${RUTAS.usuariosEditar}?id=${id}`);
}

async function toggleEstado(id, estadoActual) {
    const accion = estadoActual == 1 ? 'desactivar' : 'activar';
    if (!confirmar(`¿Desea ${accion} este usuario?`)) return;

    try {
        const r = await postJSON(API.usuarios.estado, { token: Sesion.token(), id_user: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarUsuarios(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Formulario Crear/Editar usuario ─────────────────────────── */
async function iniciarFormUsuario(modo) {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('usuarios', modo === 'editar' ? 'editar' : 'crear')) return;

    await cargarRolesEnSelect();

    if (modo === 'editar') {
        const id = getParam('id');
        if (!id) { mostrarAlerta('ID no especificado.', 'error'); return; }
        await precargarUsuario(id);
    }

    document.getElementById('formUsuario')?.addEventListener('submit', e => submitUsuario(e, modo));
    document.getElementById('btnCancelar')?.addEventListener('click', () => Router.irA(RUTAS.usuarios));
}

async function cargarRolesEnSelect() {
    try {
        const r = await postJSON(API.roles.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const sel = document.getElementById('selRol');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Seleccione un rol --</option>' +
            r.data.map(rol => `<option value="${rol.id_rol}">${esc(rol.nombre_rol)}</option>`).join('');
    } catch { /* silencioso */ }
}

async function precargarUsuario(id) {
    try {
        const r = await postJSON(API.usuarios.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const u = r.data.find(x => x.id_user == id);
        if (!u) { mostrarAlerta('Usuario no encontrado.', 'error'); return; }

        document.getElementById('txtNombre').value   = u.nombre;
        document.getElementById('txtUsername').value = u.username;
        document.getElementById('txtEmail').value    = u.email;

        const selRol = document.getElementById('selRol');
        selRol.value = u.id_rol;
        // Cambiar el rol es una acción independiente: sin ese permiso,
        // el campo queda visible pero bloqueado en su valor actual.
        if (!Sesion.tienePermiso('usuarios', 'cambiar_rol')) {
            selRol.disabled = true;
        }

        const h = document.getElementById('hdnIdUser');
        if (h) h.value = id;

        // En modo editar, password no es obligatorio
        const lblPass = document.querySelector('label[for="txtPassword"]');
        if (lblPass) lblPass.textContent = 'Nueva contraseña (dejar vacío para no cambiar)';
    } catch { /* silencioso */ }
}

async function submitUsuario(e, modo) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const nombre   = document.getElementById('txtNombre');
    const username = document.getElementById('txtUsername');
    const email    = document.getElementById('txtEmail');
    const rol      = document.getElementById('selRol');
    const pass     = document.getElementById('txtPassword');

    let valido = true;
    if (!Validaciones.requerido(nombre,   'Nombre'))   valido = false;
    if (!Validaciones.requerido(username, 'Usuario'))  valido = false;
    if (!Validaciones.requerido(email,    'Correo'))   valido = false;
    if (email.value && !Validaciones.email(email))     valido = false;
    if (!Validaciones.requerido(rol,      'Rol'))      valido = false;
    if (modo === 'crear' && !Validaciones.password(pass)) valido = false;
    if (modo === 'editar' && pass.value && !Validaciones.password(pass)) valido = false;

    if (!valido) return;

    const datos = {
        token:    Sesion.token(),
        nombre:   nombre.value.trim(),
        username: username.value.trim(),
        email:    email.value.trim(),
        id_rol:   rol.value,
    };
    if (pass.value) datos.password = pass.value;

    if (modo === 'editar') {
        const h = document.getElementById('hdnIdUser');
        datos.id_user = h?.value;
    }

    const url = modo === 'editar' ? API.usuarios.editar : API.usuarios.crear;

    try {
        const r = await postJSON(url, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            setTimeout(() => Router.irA(RUTAS.usuarios), 1200);
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
