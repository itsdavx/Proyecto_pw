/* ============================================================
   MENU-CONFIG.JS — Módulo "Configurar Menús" (solo Administrador)
   Disponibilidad global de los ItemMenu del sistema.
   ============================================================ */

async function iniciarConfigMenus() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('configmenu', 'leer')) return;

    await cargarConfigMenus();
}

async function cargarConfigMenus() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.configListar, { token: Sesion.token() });
        mostrarCargando(false);
        if (r.ok) renderizarConfigMenus(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar los ItemMenu.', 'error');
    }
}

function renderizarConfigMenus(lista) {
    const tbody = document.getElementById('tbodyConfigMenu');
    if (!tbody) return;

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="tabla-vacia">No hay ItemMenu registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(m => `
        <tr>
            <td>${esc(m.id_menu)}</td>
            <td>${resolverIcono(m.icono)} <strong>${esc(m.nombre)}</strong></td>
            <td><span class="badge badge-primary">${esc(m.modulo || '—')}</span></td>
            <td>
                <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
                    <input type="checkbox" data-id="${m.id_menu}"
                        style="width:18px;height:18px;accent-color:var(--primary)"
                        ${m.estado == 1 ? 'checked' : ''}
                        ${m.modulo === 'configmenu' ? 'disabled title="Este módulo no puede desactivarse"' : ''}>
                    <span>Activo</span>
                </label>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('input[data-id]').forEach(ch => {
        ch.addEventListener('change', () => cambiarEstadoItem(ch));
    });
}

async function cambiarEstadoItem(ch) {
    try {
        const r = await postJSON(API.menu.configEstado, {
            token:   Sesion.token(),
            id_menu: parseInt(ch.dataset.id),
            estado:  ch.checked ? 1 : 0,
        });
        if (r.ok) mostrarAlerta(r.msg, 'ok');
        else { mostrarAlerta(r.msg, 'error'); ch.checked = !ch.checked; }
    } catch {
        mostrarAlerta('Error de conexión.', 'error');
        ch.checked = !ch.checked;
    }
}
