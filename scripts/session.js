// Sesión en sessionStorage
const Sesion = {

    // Guarda token y permisos
    guardar(datos) {
        sessionStorage.setItem(APP.keys.token,    datos.token);
        sessionStorage.setItem(APP.keys.usuario,  JSON.stringify(datos.usuario));
        sessionStorage.setItem(APP.keys.permisos, JSON.stringify(datos.permisos || []));
        if (datos.menu) {
            sessionStorage.setItem(APP.keys.menuData, JSON.stringify(datos.menu));
        }
    },

    // Borra toda la sesión
    limpiar() {
        sessionStorage.removeItem(APP.keys.token);
        sessionStorage.removeItem(APP.keys.usuario);
        sessionStorage.removeItem(APP.keys.permisos);
        sessionStorage.removeItem(APP.keys.menuData);
        sessionStorage.removeItem(APP.keys.frase);
    },

    token() {
        return sessionStorage.getItem(APP.keys.token) || '';
    },

    usuario() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.usuario)) || null;
        } catch { return null; }
    },

    permisos() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.permisos)) || [];
        } catch { return []; }
    },

    menuData() {
        try {
            return JSON.parse(sessionStorage.getItem(APP.keys.menuData)) || [];
        } catch { return []; }
    },

    // Hay sesión local
    activa() {
        return !!this.token() && !!this.usuario();
    },

    // Rol 1 puede todo
    tienePermiso(modulo, accion) {
        const user = this.usuario();
        if (user && user.id_rol === 1) return true;
        return this.permisos().some(p => p.modulo === modulo && p.accion === accion);
    },

    // Revalida token contra servidor
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
        } catch {  }
        return false;
    },
};
