/* ============================================================
   MENU.JS — Renderizado de sidebar y topbar desde sessionStorage
   ============================================================ */

/* ── Mapa de módulos → íconos ────────────────────────────────── */
const MENU_ICONOS_MOD = {
    dashboard:  '◉',
    usuarios:   '◈',
    roles:      '◆',
    permisos:   '■',
    menu:       '≡',
    perfil:     '◐',
};

/* ── Renderizar sidebar completo ─────────────────────────────── */
function renderizarSidebar() {
    const aside   = document.getElementById('sidebar');
    if (!aside) return;

    const user    = Sesion.usuario();
    const menuDat = Sesion.menuData();

    aside.innerHTML = `
        <div class="sidebar-logo">
            <span class="logo-nombre">${esc(APP.nombre)}</span>
            <span class="logo-version">v${esc(APP.version)}</span>
        </div>
        <nav class="sidebar-nav" id="sidebarNav"></nav>
        <div class="sidebar-user">
            <div class="sidebar-user-nombre">${esc(user?.nombre || user?.username || '')}</div>
            <div class="sidebar-user-rol">${esc(user?.rol || '')}</div>
        </div>
    `;

    const nav = aside.querySelector('#sidebarNav');
    _construirNav(nav, menuDat);
}

function _construirNav(nav, items) {
    // Separar padres (padre_id = null) e hijos
    const padres = items.filter(i => !i.padre_id);
    const hijos  = items.filter(i =>  i.padre_id);

    padres.forEach(padre => {
        const hijosDePadre = hijos.filter(h => h.padre_id == padre.id_menu);
        const icono = resolverIcono(padre.icono) || MENU_ICONOS_MOD[padre.modulo] || '▸';
        const activo = _estaActivo(padre.url) ? 'activo' : '';

        if (hijosDePadre.length === 0) {
            // Elemento sin hijos → enlace directo
            nav.insertAdjacentHTML('beforeend', `
                <a class="nav-item ${activo}" href="${esc(padre.url || '#')}">
                    <span class="nav-icono">${icono}</span>
                    <span>${esc(padre.nombre)}</span>
                </a>
            `);
        } else {
            // Elemento con hijos → acordeón
            const grupoId = `grupo_${padre.id_menu}`;
            const tieneHijoActivo = hijosDePadre.some(h => _estaActivo(h.url));
            const abierto = tieneHijoActivo ? 'abierto' : '';

            nav.insertAdjacentHTML('beforeend', `
                <button class="nav-item nav-item-padre ${abierto}" data-grupo="${grupoId}">
                    <span class="nav-icono">${icono}</span>
                    <span>${esc(padre.nombre)}</span>
                    <span class="flecha">▾</span>
                </button>
                <div class="nav-grupo ${abierto}" id="${grupoId}">
                    ${hijosDePadre.map(h => {
                        const act = _estaActivo(h.url) ? 'activo' : '';
                        const ico = resolverIcono(h.icono) || '▸';
                        return `<a class="nav-item nav-item-hijo ${act}" href="${esc(h.url || '#')}">
                            <span class="nav-icono">${ico}</span>
                            <span>${esc(h.nombre)}</span>
                        </a>`;
                    }).join('')}
                </div>
            `);
        }
    });

    // Acordeones
    nav.querySelectorAll('.nav-item-padre').forEach(btn => {
        btn.addEventListener('click', () => {
            const grupoEl = document.getElementById(btn.dataset.grupo);
            const abierto = grupoEl.classList.contains('abierto');
            // Cerrar todos
            nav.querySelectorAll('.nav-grupo.abierto').forEach(g => g.classList.remove('abierto'));
            nav.querySelectorAll('.nav-item-padre.abierto').forEach(b => b.classList.remove('abierto'));
            if (!abierto) {
                grupoEl.classList.add('abierto');
                btn.classList.add('abierto');
            }
        });
    });
}

function _estaActivo(url) {
    if (!url || url === '#') return false;
    return window.location.pathname.endsWith(url.split('?')[0]);
}

/* ── Renderizar topbar ───────────────────────────────────────── */
function renderizarTopbar(titulo) {
    const header = document.getElementById('topbar');
    if (!header) return;

    const user = Sesion.usuario();
    header.innerHTML = `
        <div style="display:flex;align-items:center;gap:.8rem">
            <button class="btn-menu-toggle" id="btnMenuToggle">☰</button>
            <span class="topbar-titulo">${esc(titulo || APP.nombre)}</span>
        </div>
        <div class="topbar-acciones">
            <span class="topbar-usuario">${esc(user?.nombre || '')}</span>
            <button class="btn-logout" id="btnLogout">Salir</button>
        </div>
    `;

    document.getElementById('btnLogout')?.addEventListener('click', logout);
    document.getElementById('btnMenuToggle')?.addEventListener('click', _toggleSidebar);
}

/* ── Sidebar móvil ───────────────────────────────────────────── */
function _toggleSidebar() {
    const sidebar  = document.querySelector('.sidebar');
    const overlay  = document.getElementById('sidebarOverlay');
    sidebar?.classList.toggle('abierto');
    overlay?.classList.toggle('visible');
}

function _inicializarOverlay() {
    let overlay = document.getElementById('sidebarOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id        = 'sidebarOverlay';
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    overlay.addEventListener('click', _toggleSidebar);
}

/* ── Cargar menú desde servidor y guardar en sessionStorage ───── */
async function cargarMenuYRenderizar(tituloPagina) {
    // Renderizar con datos en caché primero (más rápido)
    renderizarSidebar();
    renderizarTopbar(tituloPagina);
    _inicializarOverlay();

    // Refrescar datos del menú desde el servidor
    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        if (r.ok && r.data) {
            sessionStorage.setItem(APP.keys.menuData, JSON.stringify(r.data));
            renderizarSidebar(); // Re-renderizar con datos frescos
        }
    } catch { /* Si falla, se usa la caché */ }
}
