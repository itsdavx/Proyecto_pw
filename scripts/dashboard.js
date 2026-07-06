/* ============================================================
   DASHBOARD.JS — Página de inicio: saludo y estadísticas
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    const ok = await Router.proteger();
    if (!ok) return;

    mostrarBienvenida();
    generarAccesosRapidos();

    /* Estadísticas e información administrativa: solo Administrador */
    if (Sesion.usuario()?.id_rol === 1) {
        cargarEstadisticas();
    } else {
        document.getElementById('seccionStats')?.classList.add('d-none');
    }
});

/* Accesos rápidos según el menú permitido al rol del usuario */
function generarAccesosRapidos() {
    const cont = document.getElementById('accesosRapidos');
    if (!cont) return;
    const items = Sesion.menuData().filter(m => m.url && m.modulo !== 'dashboard');
    cont.innerHTML = items.map(m => `
        <a href="${esc(m.url)}" class="btn btn-outline">
            ${resolverIcono(m.icono)} ${esc(m.nombre)}
        </a>`).join('');
}

function mostrarBienvenida() {
    const user = Sesion.usuario();
    const hora = new Date().getHours();
    let saludo = 'Buenos días';
    if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';
    else if (hora >= 19)         saludo = 'Buenas noches';

    const el = document.getElementById('saludoUsuario');
    if (el) el.textContent = `${saludo}, ${user?.nombre || user?.username || ''}`;

    const fechaEl = document.getElementById('fechaActual');
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const rolEl = document.getElementById('rolUsuario');
    if (rolEl) rolEl.textContent = user?.rol || '';
}

/* ── Conteos exactos por módulo ──────────────────────────────── */
async function cargarEstadisticas() {
    try {
        const r = await postJSON(API.dashboard.estadisticas, { token: Sesion.token() });
        if (!r.ok) return;
        _ponerConteo('statUsuarios', r.data.usuarios);
        _ponerConteo('statRoles',    r.data.roles);
        _ponerConteo('statPermisos', r.data.permisos);
    } catch { /* si falla, se mantienen los guiones */ }
}

function _ponerConteo(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== undefined && valor !== null) el.textContent = valor;
}
