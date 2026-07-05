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

    /* Verificar permiso para acceder a un módulo; si no tiene → dashboard */
    verificarPermiso(modulo, accion) {
        if (!Sesion.tienePermiso(modulo, accion)) {
            mostrarAlerta('No tiene permiso para acceder a esta sección.', 'error');
            setTimeout(() => window.location.replace(RUTAS.dashboard), 1500);
            return false;
        }
        return true;
    },

    /* Navegar a una ruta */
    irA(ruta) {
        window.location.href = ruta;
    },

    _irLogin() {
        window.location.replace(RUTAS.login);
    },
};
