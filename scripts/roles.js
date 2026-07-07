/* ============================================================
   ROLES.JS — Gestión de roles
   ============================================================ */

/* ── Lista de roles ──────────────────────────────────────────── */
async function iniciarListaRoles() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('roles', 'leer')) return;

    await cargarRoles();

    document.getElementById('btnNuevoRol')?.addEventListener('click', () => {
        Router.irA(RUTAS.rolesCrear);
    });
    document.getElementById('txtBuscar')?.addEventListener('input', filtrarRoles);
}

async function cargarRoles() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.roles.listar, { token: Sesion.token() });
        mostrarCargando(false);
        if (r.ok) renderizarTablaRoles(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar roles.', 'error');
    }
}

let _rolesData = [];

function renderizarTablaRoles(lista) {
    const tbody = document.getElementById('tbodyRoles');
    if (!tbody) return;

    _rolesData = lista || [];

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-vacia">No hay roles registrados.</td></tr>`;
        return;
    }

    const puedeEditar   = Sesion.tienePermiso('roles', 'editar');
    const puedeEliminar = Sesion.tienePermiso('roles', 'eliminar');

    tbody.innerHTML = lista.map(r => {
        const acciones = [
            (puedeEditar && r.id_rol != 1)
                ? `<button class="btn btn-sm btn-outline" onclick="irEditarRol(${r.id_rol})">Editar</button>` : '',
            (puedeEliminar && r.id_rol != 1)
                ? `<button class="btn btn-sm btn-danger" onclick="eliminarRol(${r.id_rol})">Eliminar</button>` : '',
        ].filter(Boolean).join('');

        return `
        <tr data-buscar="${esc(r.nombre_rol)} ${esc(r.descripcion || '')}">
            <td class="col-num"></td>
            <td>${esc(r.id_rol)}</td>
            <td><strong>${esc(r.nombre_rol)}</strong></td>
            <td>${esc(r.descripcion || '—')}</td>
            <td>
                <span class="badge ${r.estado == 1 ? 'badge-activo' : 'badge-inactivo'}">
                    ${r.estado == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                ${acciones ? `<div class="btn-group">${acciones}</div>` : '<span class="text-muted">—</span>'}
            </td>
        </tr>`;
    }).join('');

    renumerarFilas(tbody);
}

function eliminarRol(id) {
    const rol = _rolesData.find(r => r.id_rol == id);
    if (!rol) return;

    confirmarEliminacionCritica({
        tipo:   'Rol',
        nombre: rol.nombre_rol,
        accion: async () => {
            try {
                const r = await postJSON(API.roles.eliminar, { token: Sesion.token(), id_rol: id });
                if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarRoles(); }
                else mostrarAlerta(r.msg, 'error');
            } catch { mostrarAlerta('Error de conexión.', 'error'); }
        },
    });
}

function irEditarRol(id) {
    Router.irA(`${RUTAS.rolesCrear}?id=${id}`);
}

function filtrarRoles() {
    const q = document.getElementById('txtBuscar').value.toLowerCase();
    document.querySelectorAll('#tbodyRoles tr[data-buscar]').forEach(tr => {
        tr.style.display = tr.dataset.buscar.toLowerCase().includes(q) ? '' : 'none';
    });
    renumerarFilas(document.getElementById('tbodyRoles'));
}

/* ── Formulario Crear/Editar rol ─────────────────────────────── */
async function iniciarFormRol() {
    const ok = await Router.proteger();
    if (!ok) return;

    const id   = getParam('id');
    const modo = id ? 'editar' : 'crear';

    if (!Router.verificarPermiso('roles', modo)) return;

    if (modo === 'editar') await precargarRol(id);

    document.getElementById('formRol')?.addEventListener('submit', e => submitRol(e, modo, id));
    document.getElementById('btnCancelar')?.addEventListener('click', () => Router.irA(RUTAS.roles));
}

async function precargarRol(id) {
    try {
        const r = await postJSON(API.roles.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const rol = r.data.find(x => x.id_rol == id);
        if (!rol) return;
        document.getElementById('txtNombreRol').value  = rol.nombre_rol;
        document.getElementById('txtDescripcion').value = rol.descripcion || '';
        document.getElementById('chkEstado').checked   = rol.estado == 1;
    } catch { /* silencioso */ }
}

async function submitRol(e, modo, id) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const nombre = document.getElementById('txtNombreRol');
    if (!Validaciones.requerido(nombre, 'Nombre del rol')) return;

    const datos = {
        token:       Sesion.token(),
        nombre_rol:  nombre.value.trim(),
        descripcion: document.getElementById('txtDescripcion').value.trim(),
        estado:      document.getElementById('chkEstado').checked ? 1 : 0,
    };
    if (modo === 'editar') datos.id_rol = id;

    const url = modo === 'editar' ? API.roles.editar : API.roles.crear;

    try {
        const r = await postJSON(url, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            setTimeout(() => Router.irA(RUTAS.roles), 1200);
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
