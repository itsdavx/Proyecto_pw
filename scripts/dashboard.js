/* ============================================================
   DASHBOARD.JS — Página principal del sistema
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    const ok = await Router.proteger();
    if (!ok) return;

    await cargarMenuYRenderizar('Dashboard');
    mostrarBienvenida();
});

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
