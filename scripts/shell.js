// Contenedor con iframe
const Shell = {

    frame: null,
    _CLAVE_RUTA: 'shell_ruta_actual',

    // Arranca el shell
    async iniciar() {
        const ok = await Router.proteger();
        if (!ok) return;
        Router.enmascarar();

        this.frame = document.getElementById('frameContenido');

        await cargarMenuYRenderizar();

        document.getElementById('sidebar').addEventListener('click', e => {
            const enlace = e.target.closest('a.nav-item');
            if (!enlace) return;
            const url = enlace.getAttribute('href');
            if (!url || url === '#') return;
            e.preventDefault();
            this.cargar(url);
            this._cerrarSidebarMovil();
            if (/^frame[1-5]$/.test(enlace.dataset.modulo || '')) colapsarSidebar();
        });

        this.frame.addEventListener('load', () => this._alCargarFrame());

        let inicial = sessionStorage.getItem(this._CLAVE_RUTA);
        if (!this._esRutaInterna(inicial)) inicial = RUTAS.dashboardInicio;
        this.cargar(inicial);
    },

    // Evita anidar el shell
    _mapear(url) {
        try {
            const destino = new URL(url, window.location.origin);
            const shell   = new URL(RUTAS.dashboard, window.location.origin);
            if (destino.pathname === shell.pathname) return RUTAS.dashboardInicio;
        } catch {  }
        return url;
    },

    // Solo rutas del proyecto
    _esRutaInterna(ruta) {
        if (!ruta) return false;
        try {
            const u = new URL(ruta, window.location.origin);
            return u.origin === window.location.origin
                && u.pathname.startsWith('/NRC30713/Proyecto_pw/paginas/');
        } catch { return false; }
    },

    // Carga página en iframe
    cargar(url) {
        if (!url) return;
        const destino = this._mapear(url);
        try { this.frame.contentWindow.location.replace(destino); }
        catch { this.frame.src = destino; }
        this.marcarActivo(destino);
    },

    // Sincroniza título y ruta
    _alCargarFrame() {
        let doc;
        try { doc = this.frame.contentDocument; } catch { return; }
        if (!doc || !doc.location || doc.location.href === 'about:blank') return;

        const titulo = (doc.title || '').split('—')[0].trim();
        const el = document.querySelector('.topbar-titulo');
        if (el && titulo) el.textContent = titulo;
        if (doc.title) document.title = doc.title;

        const rutaFrame = doc.location.pathname + doc.location.search;
        this.marcarActivo(rutaFrame);
        sessionStorage.setItem(this._CLAVE_RUTA, rutaFrame);
    },

    // Resalta enlace del menú
    marcarActivo(url) {
        const nav = document.getElementById('sidebarNav');
        if (!nav) return;

        let path;
        try { path = new URL(url, window.location.origin).pathname; }
        catch { return; }

        nav.querySelectorAll('.nav-item.activo').forEach(el => el.classList.remove('activo'));

        const enlaces = [...nav.querySelectorAll('a.nav-item[href]')];
        const rutaDe  = a => {
            try { return new URL(this._mapear(a.getAttribute('href')), window.location.origin).pathname; }
            catch { return null; }
        };

        let activo = enlaces.find(a => rutaDe(a) === path);
        if (!activo) {
            const carpeta = path.replace(/\/[^/]*$/, '/');
            activo = enlaces.find(a => (rutaDe(a) || '').startsWith(carpeta));
        }
        if (!activo) return;

        activo.classList.add('activo');

        const grupo = activo.closest('.nav-grupo');
        if (grupo && !grupo.classList.contains('abierto')) {
            grupo.classList.add('abierto');
            nav.querySelector(`[data-grupo="${grupo.id}"]`)?.classList.add('abierto');
        }
    },

    _cerrarSidebarMovil() {
        document.querySelector('.sidebar')?.classList.remove('abierto');
        document.getElementById('sidebarOverlay')?.classList.remove('visible');
    },
};

document.addEventListener('DOMContentLoaded', () => Shell.iniciar());
