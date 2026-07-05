/* ============================================================
   OPCIONES.JS — Gestión de opciones de submenú
   ============================================================ */

let _menuSelec = null;

async function iniciarOpciones() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('opciones', 'leer')) return;

    cargarMenuYRenderizar('Opciones de Menú');
    await cargarMenusSelect();

    document.getElementById('selMenu')?.addEventListener('change', onCambiarMenu);
    document.getElementById('btnNuevaOpcion')?.addEventListener('click', mostrarModalNuevaOpcion);
}

async function cargarMenusSelect() {
    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const sel = document.getElementById('selMenu');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Seleccione un menú --</option>' +
            r.data.map(m => `<option value="${m.id_menu}">${esc(m.nombre)}</option>`).join('');
    } catch { mostrarAlerta('Error al cargar menús.', 'error'); }
}

async function onCambiarMenu() {
    _menuSelec = document.getElementById('selMenu').value;
    if (!_menuSelec) {
        document.getElementById('tbodyOpciones').innerHTML =
            `<tr><td colspan="5" class="tabla-vacia">Seleccione un menú.</td></tr>`;
        return;
    }
    await cargarOpciones();
}

async function cargarOpciones() {
    if (!_menuSelec) return;
    mostrarCargando(true);
    try {
        const r = await postJSON(API.opciones.listar, { token: Sesion.token(), id_menu: _menuSelec });
        mostrarCargando(false);
        if (r.ok) renderizarTablaOpciones(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar opciones.', 'error');
    }
}

function renderizarTablaOpciones(lista) {
    const tbody = document.getElementById('tbodyOpciones');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="tabla-vacia">Sin opciones para este menú.</td></tr>`;
        return;
    }

    const puedElim = Sesion.tienePermiso('opciones', 'eliminar');

    tbody.innerHTML = lista.map(o => `
        <tr>
            <td>${esc(o.id_opcion)}</td>
            <td><strong>${esc(o.nombre)}</strong></td>
            <td><code>${esc(o.accion || '—')}</code></td>
            <td>${esc(o.orden)}</td>
            <td>
                ${puedElim
                    ? `<button class="btn btn-sm btn-danger" onclick="eliminarOpcion(${o.id_opcion})">Eliminar</button>`
                    : '—'}
            </td>
        </tr>
    `).join('');
}

/* ── Modal nueva opción ──────────────────────────────────────── */
function mostrarModalNuevaOpcion() {
    const modal = document.getElementById('modalNuevaOpcion');
    modal?.classList.add('visible');
    document.getElementById('formNuevaOpcion')?.reset();
}

function cerrarModalNuevaOpcion() {
    document.getElementById('modalNuevaOpcion')?.classList.remove('visible');
}

async function submitNuevaOpcion(e) {
    e.preventDefault();
    if (!_menuSelec) { mostrarAlerta('Seleccione un menú primero.', 'warning'); return; }

    const form   = e.target;
    Validaciones.limpiar(form);
    const nombre = document.getElementById('txtNombreOpcion');
    if (!Validaciones.requerido(nombre, 'Nombre')) return;

    const datos = {
        token:    Sesion.token(),
        id_menu:  _menuSelec,
        nombre:   nombre.value.trim(),
        accion:   document.getElementById('txtAccionOpcion').value.trim(),
        orden:    document.getElementById('txtOrdenOpcion').value || 0,
        estado:   1,
    };

    try {
        const r = await postJSON(API.opciones.crear, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            cerrarModalNuevaOpcion();
            await cargarOpciones();
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

async function eliminarOpcion(id) {
    if (!confirmar('¿Eliminar esta opción?')) return;
    try {
        const r = await postJSON(API.opciones.eliminar, { token: Sesion.token(), id_opcion: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarOpciones(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formNuevaOpcion')?.addEventListener('submit', submitNuevaOpcion);
    document.getElementById('btnCerrarModal')?.addEventListener('click', cerrarModalNuevaOpcion);
    document.getElementById('btnCancelarModal')?.addEventListener('click', cerrarModalNuevaOpcion);
    document.getElementById('modalNuevaOpcion')?.addEventListener('click', e => {
        if (e.target === e.currentTarget) cerrarModalNuevaOpcion();
    });
    iniciarOpciones();
});
