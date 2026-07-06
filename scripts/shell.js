/* ============================================================
   SHELL.JS — Estructura única del sistema
   Sidebar + topbar se renderizan UNA sola vez; las páginas de
   contenido se cargan en el frame interno sin recargar el resto.
   ============================================================ */

const Shell = {

    frame: null,

    async iniciar() {
        const ok = await Router.proteger();
        if (!ok) return;

        this.frame = document.getElementById('frameContenido');

        await cargarMenuYRenderizar();

        /* Clic en enlaces del sidebar → cargar en el frame */
        document.getElementById('sidebar').addEventListener('click', e => {
            const enlace = e.target.closest('a.nav-item');
            if (!enlace) return;
            const url = enlace.getAttribute('href');
            if (!url || url === '#') return;
            e.preventDefault();
            this.cargar(url);
            this._cerrarSidebarMovil();
        });

        this.frame.addEventListener('load', () => this._alCargarFrame());

        /* Página inicial: hash de la URL (permite refrescar sin perder
           la sección actual) o la página de inicio del dashboard */
        let inicial = decodeURIComponent((window.location.hash || '').replace(/^#/, ''));
        if (!this._esRutaInterna(inicial)) inicial = RUTAS.dashboardInicio;
        this.cargar(inicial);
    },

    /* El ítem "Dashboard" del menú apunta al shell; dentro del frame
       se carga la página de inicio para no anidar el shell. */
    _mapear(url) {
        try {
            const destino = new URL(url, window.location.origin);
            const shell   = new URL(RUTAS.dashboard, window.location.origin);
            if (destino.pathname === shell.pathname) return RUTAS.dashboardInicio;
        } catch { /* URL inválida: se usa tal cual */ }
        return url;
    },

    /* Solo se aceptan páginas del propio sistema dentro del frame */
    _esRutaInterna(ruta) {
        if (!ruta) return false;
        try {
            const u = new URL(ruta, window.location.origin);
            return u.origin === window.location.origin
                && u.pathname.startsWith('/NRC30713-Web/Proyecto_pw/paginas/');
        } catch { return false; }
    },

    cargar(url) {
        if (!url) return;
        const destino = this._mapear(url);
        /* replace() evita acumular historial con cada cambio de sección */
        try { this.frame.contentWindow.location.replace(destino); }
        catch { this.frame.src = destino; }
        this.marcarActivo(destino);
    },

    _alCargarFrame() {
        let doc;
        try { doc = this.frame.contentDocument; } catch { return; }
        if (!doc || !doc.location || doc.location.href === 'about:blank') return;

        /* Título de la sección en el topbar y en la pestaña */
        const titulo = (doc.title || '').split('—')[0].trim();
        const el = document.querySelector('.topbar-titulo');
        if (el && titulo) el.textContent = titulo;
        if (doc.title) document.title = doc.title;

        /* Sincronizar ítem activo y hash (la navegación también puede
           originarse con enlaces dentro del propio frame) */
        const rutaFrame = doc.location.pathname + doc.location.search;
        this.marcarActivo(rutaFrame);
        history.replaceState(null, '', '#' + rutaFrame);
    },

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

        /* Coincidencia exacta o, para formularios (frmCrear, frmEditar),
           por carpeta del módulo */
        let activo = enlaces.find(a => rutaDe(a) === path);
        if (!activo) {
            const carpeta = path.replace(/\/[^/]*$/, '/');
            activo = enlaces.find(a => (rutaDe(a) || '').startsWith(carpeta));
        }
        if (!activo) return;

        activo.classList.add('activo');

        /* Abrir el acordeón que lo contiene */
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
