/* ============================================================
   ROUTER.JS — Guardias de navegación y redirección
   ============================================================ */

const Router = {

    /* Llamar al inicio de cada página protegida.
       Verifica sesión con el servidor; si falla → login. */
    async proteger() {
        if (!Sesion.activa()) {
            this._irLogin();
            return false;
        }
        mostrarCargando(true);
        const ok = await Sesion.verificar();
        mostrarCargando(false);
        if (!ok) {
            Sesion.limpiar();
            this._irLogin();
            return false;
        }
        /* Redirigir al cambio de password obligatorio */
        const user = Sesion.usuario();
        const esCambioPass = window.location.pathname.includes('frmCambiarPassword');
        if (user && user.primer_login == 1 && !esCambioPass) {
            window.location.replace(RUTAS.cambiarPassword);
            return false;
        }
        return true;
    },

    /* Llamar en la página de login: si ya está autenticado → dashboard */
    async redirigirSiAutenticado() {
        if (!Sesion.activa()) return;
        const ok = await Sesion.verificar();
        if (ok) window.location.replace(RUTAS.dashboard);
    },

    /* Verificar permiso para acceder a un módulo; si no tiene → dashboard.
       Un ItemMenu desactivado en "Configurar Menús" bloquea a todos los roles. */
    verificarPermiso(modulo, accion) {
        const menuData     = Sesion.menuData();
        const moduloActivo = menuData.length === 0 || menuData.some(m => m.modulo === modulo);
        if (!moduloActivo || !Sesion.tienePermiso(modulo, accion)) {
            mostrarAlerta('No tiene permiso para acceder a esta sección.', 'error');
            setTimeout(() => window.location.replace(this._destinoDashboard()), 1500);
            return false;
        }
        return true;
    },

    /* Navegar a una ruta */
    irA(ruta) {
        if (ruta === RUTAS.dashboard) ruta = this._destinoDashboard();
        window.location.href = ruta;
    },

    /* Dentro del frame del shell nunca se carga el shell de nuevo:
       se navega a la página de inicio del dashboard. */
    _destinoDashboard() {
        return (window.self !== window.top) ? RUTAS.dashboardInicio : RUTAS.dashboard;
    },

    /* El login siempre reemplaza la ventana completa, aunque la
       sesión expire dentro del frame interno. */
    _irLogin() {
        window.top.location.replace(RUTAS.login);
    },
};
