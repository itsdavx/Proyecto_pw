/* ============================================================
   MENU-CONFIG.JS — Módulo "Configurar Menús" (solo Administrador)
   Disponibilidad global de los ItemMenu. Los cambios se acumulan
   y se persisten con el botón "Guardar".
   ============================================================ */

let _configItems = [];   // {id_menu, nombre, icono, modulo, estado, nuevo}

async function iniciarConfigMenus() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('configmenu', 'leer')) return;

    document.getElementById('btnGuardarConfig')?.addEventListener('click', guardarConfigMenus);
    await cargarConfigMenus();
}

async function cargarConfigMenus() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.configListar, { token: Sesion.token() });
        mostrarCargando(false);
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }
        _configItems = (r.data || []).map(m => ({ ...m, nuevo: m.estado == 1 }));
        renderizarConfigMenus();
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar los ItemMenu.', 'error');
    }
}

function renderizarConfigMenus() {
    const tbody = document.getElementById('tbodyConfigMenu');
    if (!tbody) return;

    if (_configItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="tabla-vacia">No hay ItemMenu registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = _configItems.map(m => `
        <tr>
            <td>${esc(m.id_menu)}</td>
            <td>${resolverIcono(m.icono)} <strong>${esc(m.nombre)}</strong></td>
            <td><span class="badge badge-primary">${esc(m.modulo || '—')}</span></td>
            <td>
                <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
                    <input type="checkbox" data-id="${m.id_menu}"
                        style="width:18px;height:18px;accent-color:var(--primary)"
                        ${m.nuevo ? 'checked' : ''}
                        ${m.modulo === 'configmenu' ? 'disabled title="Este módulo no puede desactivarse"' : ''}>
                    <span>Activo</span>
                </label>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('input[data-id]').forEach(ch => {
        ch.addEventListener('change', () => {
            const item = _configItems.find(m => m.id_menu == ch.dataset.id);
            if (item) item.nuevo = ch.checked;
        });
    });
}

/* Persiste todos los cambios, refresca la tabla y el sidebar del shell */
async function guardarConfigMenus() {
    const cambios = _configItems.filter(m => m.nuevo !== (m.estado == 1));
    if (cambios.length === 0) {
        mostrarAlerta('No hay cambios por guardar.', 'warning');
        return;
    }

    let errores = 0;
    for (const m of cambios) {
        try {
            const r = await postJSON(API.menu.configEstado, {
                token:   Sesion.token(),
                id_menu: m.id_menu,
                estado:  m.nuevo ? 1 : 0,
            });
            if (!r.ok) { errores++; mostrarAlerta(r.msg, 'error'); }
        } catch { errores++; }
    }

    await cargarConfigMenus();

    /* Reflejar de inmediato en el sidebar del shell, sin cerrar sesión */
    try {
        const p = window.parent;
        if (p !== window && typeof p.cargarMenuYRenderizar === 'function') {
            await p.cargarMenuYRenderizar(document.title.split('—')[0].trim());
            p.Shell?.marcarActivo?.(window.location.pathname);
        }
    } catch { /* fuera del shell no hay sidebar que refrescar */ }

    if (errores === 0) {
        mostrarAlerta(`Cambios guardados (${cambios.length} ItemMenu actualizados).`, 'ok');
    }
}
