/* ============================================================
   SESSION.JS — Manejo de sesión en sessionStorage
   ============================================================ */

const Sesion = {

    /* Guardar datos de sesión tras login exitoso */
    guardar(datos) {
        sessionStorage.setItem(APP.keys.token,    datos.token);
        sessionStorage.setItem(APP.keys.usuario,  JSON.stringify(datos.usuario));
        sessionStorage.setItem(APP.keys.permisos, JSON.stringify(datos.permisos || []));
        if (datos.menu) {
            sessionStorage.setItem(APP.keys.menuData, JSON.stringify(datos.menu));
        }
    },

    /* Limpiar toda la sesión (al cerrar sesión o expirar) */
    limpiar() {
        sessionStorage.removeItem(APP.keys.token);
        sessionStorage.removeItem(APP.keys.usuario);
        sessionStorage.removeItem(APP.keys.permisos);
        sessionStorage.removeItem(APP.keys.menuData);
    },

    /* Obtener token */
    token() {
        return sessionStorage.getItem(APP.keys.token) || '';
    },

    /* Obtener objeto usuario */
    usuario() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.usuario)) || null;
        } catch { return null; }
    },

    /* Obtener array de permisos [{modulo, accion}, ...] */
    permisos() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.permisos)) || [];
        } catch { return []; }
    },

    /* Obtener datos de menú */
    menuData() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.menuData)) || [];
        } catch { return []; }
    },

    /* Comprobar si hay sesión activa */
    activa() {
        return !!this.token() && !!this.usuario();
    },

    /* Verificar permiso: devuelve true si el rol tiene modulo+accion */
    tienePermiso(modulo, accion) {
        const user = this.usuario();
        if (user && user.id_rol === 1) return true; // super-admin
        return this.permisos().some(p => p.modulo === modulo && p.accion === accion);
    },

    /* Verificar sesión con el servidor y refrescar permisos */
    async verificar() {
        if (!this.activa()) return false;
        try {
            const r = await postJSON(API.auth.verificarSesion, { token: this.token() });
            if (r.ok && r.data) {
                const prev = this.usuario();
                sessionStorage.setItem(APP.keys.usuario,  JSON.stringify({ ...prev, ...r.data.usuario }));
                sessionStorage.setItem(APP.keys.permisos, JSON.stringify(r.data.permisos || []));
                return true;
            }
        } catch { /* red caída */ }
        return false;
    },
};
