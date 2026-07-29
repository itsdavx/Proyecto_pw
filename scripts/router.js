// Guardia de navegación
const Router = {

    // Exige sesión válida
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
        const user = Sesion.usuario();
        const esCambioPass = window.location.pathname.includes('frmCambiarPassword');
        // Fuerza cambio de contraseña
        if (user && user.primer_login == 1 && !esCambioPass) {
            window.location.replace(RUTAS.cambiarPassword);
            return false;
        }
        return true;
    },

    // Evita login si autenticado
    async redirigirSiAutenticado() {
        if (!Sesion.activa()) return false;
        const ok = await Sesion.verificar();
        if (ok) { window.location.replace(RUTAS.dashboard); return true; }
        return false;
    },

    // Oculta la ruta real
    enmascarar() {
        if (window.self !== window.top) return;
        const actual = window.location.pathname + window.location.search;
        if (actual !== RUTAS.base) history.replaceState(null, '', RUTAS.base);
    },

    // Corta acceso sin permiso
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

    irA(ruta) {
        if (ruta === RUTAS.dashboard) ruta = this._destinoDashboard();
        window.location.href = ruta;
    },

    // Destino según iframe
    _destinoDashboard() {
        return (window.self !== window.top) ? RUTAS.dashboardInicio : RUTAS.dashboard;
    },

    _irLogin() {
        window.top.location.replace(RUTAS.login);
    },
};
