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

    /* Llamar en la página de login: si ya está autenticado → dashboard.
       Devuelve true si redirigió (la página de login no debe seguir
       inicializándose en ese caso). */
    async redirigirSiAutenticado() {
        if (!Sesion.activa()) return false;
        const ok = await Sesion.verificar();
        if (ok) { window.location.replace(RUTAS.dashboard); return true; }
        return false;
    },

    /* Oculta la ruta real de la página superior (login, shell o cambio
       de contraseña obligatorio) para que la barra de direcciones
       siempre muestre la raíz del proyecto. No aplica dentro del frame
       del shell: ahí la ruta real de cada módulo sigue siendo necesaria
       para sincronizar el ítem activo y el refresco (ver shell.js). */
    enmascarar() {
        if (window.self !== window.top) return;
        const actual = window.location.pathname + window.location.search;
        if (actual !== RUTAS.base) history.replaceState(null, '', RUTAS.base);
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
