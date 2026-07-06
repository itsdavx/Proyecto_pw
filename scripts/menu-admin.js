/* ============================================================
   MENU-ADMIN.JS — Administración de ítems de menú
   ============================================================ */

let _itemsMenu = [];

async function iniciarListaMenu() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('menu', 'leer')) return;

    if (!Sesion.tienePermiso('menu', 'crear')) {
        document.getElementById('btnNuevoMenu')?.classList.add('d-none');
    }

    await cargarItemsMenu();

    document.getElementById('btnNuevoMenu')?.addEventListener('click', () => {
        Router.irA(RUTAS.menuCrear);
    });
    document.getElementById('btnGuardarOrden')?.addEventListener('click', guardarOrdenUsuario);
}

async function cargarItemsMenu() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        mostrarCargando(false);
        if (r.ok) renderizarTablaMenu(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar el menú.', 'error');
    }
}

function renderizarTablaMenu(lista) {
    const tbody = document.getElementById('tbodyMenu');
    if (!tbody) return;

    _itemsMenu = lista || [];

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">No hay ítems de menú.</td></tr>`;
        return;
    }

    const puedEditar  = Sesion.tienePermiso('menu', 'editar');
    const puedElim    = Sesion.tienePermiso('menu', 'eliminar');

    /* Usuarios sin permisos de administración solo reordenan su propio menú */
    const modoOrden = !puedEditar && !puedElim && !Sesion.tienePermiso('menu', 'crear');
    document.getElementById('btnGuardarOrden')?.classList.toggle('d-none', !modoOrden);

    if (modoOrden) {
        tbody.innerHTML = lista.map((m, i) => `
            <tr>
                <td>${esc(m.id_menu)}</td>
                <td>
                    ${m.padre_id ? '<span style="padding-left:1.5rem">└ </span>' : ''}
                    ${esc(m.nombre)}
                </td>
                <td><code>${esc(m.url || '—')}</code></td>
                <td><span class="badge badge-primary">${esc(m.modulo || '—')}</span></td>
                <td>${i + 1}</td>
                <td><span class="badge badge-activo">Activo</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" ${i === 0 ? 'disabled' : ''}
                            onclick="moverItemMenu(${i}, -1)">↑</button>
                        <button class="btn btn-sm btn-outline" ${i === lista.length - 1 ? 'disabled' : ''}
                            onclick="moverItemMenu(${i}, 1)">↓</button>
                    </div>
                </td>
            </tr>
        `).join('');
        return;
    }

    tbody.innerHTML = lista.map(m => `
        <tr>
            <td>${esc(m.id_menu)}</td>
            <td>
                ${m.padre_id ? '<span style="padding-left:1.5rem">└ </span>' : ''}
                ${esc(m.nombre)}
            </td>
            <td><code>${esc(m.url || '—')}</code></td>
            <td><span class="badge badge-primary">${esc(m.modulo || '—')}</span></td>
            <td>${esc(m.orden)}</td>
            <td>
                <span class="badge ${m.estado == 1 ? 'badge-activo' : 'badge-inactivo'}">
                    ${m.estado == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    ${puedEditar ? `<button class="btn btn-sm btn-outline" onclick="irEditarMenu(${m.id_menu})">Editar</button>` : ''}
                    ${puedElim   ? `<button class="btn btn-sm btn-danger"  onclick="eliminarMenu(${m.id_menu})">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function moverItemMenu(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= _itemsMenu.length) return;
    [_itemsMenu[i], _itemsMenu[j]] = [_itemsMenu[j], _itemsMenu[i]];
    renderizarTablaMenu(_itemsMenu);
}

async function guardarOrdenUsuario() {
    const items = _itemsMenu.map((m, i) => ({ id_menu: m.id_menu, orden: i + 1 }));
    try {
        const r = await postJSON(API.menu.ordenar, { token: Sesion.token(), items });
        if (r.ok) mostrarAlerta(r.msg, 'ok');
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

function irEditarMenu(id) {
    Router.irA(`${RUTAS.menuCrear}?id=${id}`);
}

async function eliminarMenu(id) {
    if (!confirmar('¿Eliminar este ítem de menú? Si tiene hijos, no se podrá eliminar.')) return;
    try {
        const r = await postJSON(API.menu.eliminar, { token: Sesion.token(), id_menu: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarItemsMenu(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Formulario Crear/Editar ítem de menú ────────────────────── */
async function iniciarFormMenu() {
    const ok = await Router.proteger();
    if (!ok) return;

    const id   = getParam('id');
    const modo = id ? 'editar' : 'crear';

    if (!Router.verificarPermiso('menu', modo)) return;

    await cargarMenuPadresSelect();
    if (modo === 'editar') await precargarMenu(id);

    document.getElementById('formMenu')?.addEventListener('submit', e => submitMenu(e, modo, id));
    document.getElementById('btnCancelar')?.addEventListener('click', () => Router.irA(RUTAS.menu));
}

async function cargarMenuPadresSelect() {
    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const padres = r.data.filter(m => !m.padre_id);
        const sel    = document.getElementById('selPadre');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Sin padre (nivel raíz) --</option>' +
            padres.map(m => `<option value="${m.id_menu}">${esc(m.nombre)}</option>`).join('');
    } catch { /* silencioso */ }
}

async function precargarMenu(id) {
    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const m = r.data.find(x => x.id_menu == id);
        if (!m) return;
        document.getElementById('txtNombreMenu').value  = m.nombre;
        document.getElementById('txtIcono').value       = m.icono || '';
        document.getElementById('txtUrl').value         = m.url   || '';
        document.getElementById('txtModulo').value      = m.modulo || '';
        document.getElementById('txtOrden').value       = m.orden;
        document.getElementById('selPadre').value       = m.padre_id || '';
        document.getElementById('chkEstadoMenu').checked = m.estado == 1;
    } catch { /* silencioso */ }
}

async function submitMenu(e, modo, id) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const nombre = document.getElementById('txtNombreMenu');
    if (!Validaciones.requerido(nombre, 'Nombre')) return;

    const datos = {
        token:    Sesion.token(),
        nombre:   nombre.value.trim(),
        icono:    document.getElementById('txtIcono').value.trim(),
        url:      document.getElementById('txtUrl').value.trim(),
        modulo:   document.getElementById('txtModulo').value.trim(),
        orden:    document.getElementById('txtOrden').value || 0,
        padre_id: document.getElementById('selPadre').value || null,
        estado:   document.getElementById('chkEstadoMenu').checked ? 1 : 0,
    };
    if (modo === 'editar') datos.id_menu = id;

    const url = modo === 'editar' ? API.menu.editar : API.menu.crear;

    try {
        const r = await postJSON(url, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            setTimeout(() => Router.irA(RUTAS.menu), 1200);
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
