// Iconos por módulo
const MENU_ICONOS_MOD = {
    dashboard:  '🏠︎',
    usuarios:   '👥︎',
    roles:      '⛨',
    permisos:   '🔒︎',
    menu:       '≡',
    perfil:     '👤︎',
};

// Pinta el menú lateral
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

// Árbol padres e hijos
function _construirNav(nav, items) {
    const padres = items.filter(i => !i.padre_id);
    const hijos  = items.filter(i =>  i.padre_id);

    padres.forEach(padre => {
        const hijosDePadre = hijos.filter(h => h.padre_id == padre.id_menu);
        const icono = resolverIcono(padre.icono) || MENU_ICONOS_MOD[padre.modulo] || '▸';
        const activo = _estaActivo(padre.url) ? 'activo' : '';

        if (hijosDePadre.length === 0) {
            nav.insertAdjacentHTML('beforeend', `
                <a class="nav-item ${activo}" href="${esc(padre.url || '#')}" aria-label="${esc(padre.nombre)}" data-modulo="${esc(padre.modulo || '')}">
                    <span class="nav-icono" aria-hidden="true">${icono}</span>
                    <span>${esc(padre.nombre)}</span>
                </a>
            `);
        } else {
            const grupoId = `grupo_${padre.id_menu}`;
            const tieneHijoActivo = hijosDePadre.some(h => _estaActivo(h.url));
            const abierto = tieneHijoActivo ? 'abierto' : '';

            nav.insertAdjacentHTML('beforeend', `
                <button class="nav-item nav-item-padre ${abierto}" data-grupo="${grupoId}" aria-label="${esc(padre.nombre)}">
                    <span class="nav-icono" aria-hidden="true">${icono}</span>
                    <span>${esc(padre.nombre)}</span>
                    <span class="flecha" aria-hidden="true">▾</span>
                </button>
                <div class="nav-grupo ${abierto}" id="${grupoId}">
                    ${hijosDePadre.map(h => {
                        const act = _estaActivo(h.url) ? 'activo' : '';
                        const ico = resolverIcono(h.icono) || '▸';
                        return `<a class="nav-item nav-item-hijo ${act}" href="${esc(h.url || '#')}" aria-label="${esc(h.nombre)}" data-modulo="${esc(h.modulo || '')}">
                            <span class="nav-icono" aria-hidden="true">${ico}</span>
                            <span>${esc(h.nombre)}</span>
                        </a>`;
                    }).join('')}
                </div>
            `);
        }
    });

    // Solo un grupo abierto
    nav.querySelectorAll('.nav-item-padre').forEach(btn => {
        btn.addEventListener('click', () => {
            const grupoEl = document.getElementById(btn.dataset.grupo);
            const abierto = grupoEl.classList.contains('abierto');
            nav.querySelectorAll('.nav-grupo.abierto').forEach(g => g.classList.remove('abierto'));
            nav.querySelectorAll('.nav-item-padre.abierto').forEach(b => b.classList.remove('abierto'));
            if (!abierto) {
                grupoEl.classList.add('abierto');
                btn.classList.add('abierto');
            }
        });
    });
}

// Enlace de la página
function _estaActivo(url) {
    if (!url || url === '#') return false;
    return window.location.pathname.endsWith(url.split('?')[0]);
}

// Pinta la barra superior
function renderizarTopbar(titulo) {
    const header = document.getElementById('topbar');
    if (!header) return;

    const user = Sesion.usuario();
    header.innerHTML = `
        <div style="display:flex;align-items:center;gap:.8rem">
            <button class="btn-menu-toggle" id="btnMenuToggle" title="Contraer / expandir menú">☰</button>
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

// Estado colapsado persistido
const CLAVE_SIDEBAR_COLAPSADO = 'sidebar_colapsado';

// Detecta pantalla móvil
function _esPantallaMovil() {
    return window.matchMedia('(max-width: 768px)').matches;
}

// Abre o colapsa menú
function _toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (_esPantallaMovil()) {
        sidebar.classList.toggle('abierto');
        document.getElementById('sidebarOverlay')?.classList.toggle('visible');
        return;
    }

    const colapsado = sidebar.classList.toggle('colapsado');
    sessionStorage.setItem(CLAVE_SIDEBAR_COLAPSADO, colapsado ? '1' : '0');
}

// Colapsa en escritorio
function colapsarSidebar() {
    if (_esPantallaMovil()) return;
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar || sidebar.classList.contains('colapsado')) return;
    sidebar.classList.add('colapsado');
    sessionStorage.setItem(CLAVE_SIDEBAR_COLAPSADO, '1');
}

// Restaura estado guardado
function aplicarEstadoSidebar() {
    document.querySelector('.sidebar')
        ?.classList.toggle('colapsado', sessionStorage.getItem(CLAVE_SIDEBAR_COLAPSADO) === '1');
}

// Tooltip con menú colapsado
function _inicializarTooltipSidebar() {
    const aside = document.getElementById('sidebar');
    if (!aside || aside.dataset.tooltipListo) return;
    aside.dataset.tooltipListo = '1';

    let tip = document.getElementById('sidebarTooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'sidebarTooltip';
        tip.className = 'sidebar-tooltip';
        tip.setAttribute('role', 'tooltip');
        document.body.appendChild(tip);
    }

    const mostrar = (item) => {
        if (_esPantallaMovil() || !aside.classList.contains('colapsado')) return;
        const nombre = item.getAttribute('aria-label');
        if (!nombre) return;
        const r = item.getBoundingClientRect();
        tip.textContent  = nombre;
        tip.style.top    = (r.top + r.height / 2) + 'px';
        tip.style.left   = (r.right + 10) + 'px';
        tip.classList.add('visible');
    };
    const ocultar = () => tip.classList.remove('visible');

    aside.addEventListener('mouseover', e => {
        const item = e.target.closest('.nav-item');
        if (item) mostrar(item);
    });
    aside.addEventListener('mouseout', e => {
        const item = e.target.closest('.nav-item');
        if (item && item.contains(e.relatedTarget)) return;
        ocultar();
    });
    aside.addEventListener('focusin', e => {
        const item = e.target.closest('.nav-item');
        if (item) mostrar(item);
    });
    aside.addEventListener('focusout', ocultar);
    aside.addEventListener('click', ocultar);
}

// Fondo oscuro en móvil
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

// Refresca menú desde servidor
async function cargarMenuYRenderizar(tituloPagina) {
    renderizarSidebar();
    renderizarTopbar(tituloPagina);
    _inicializarOverlay();
    _inicializarTooltipSidebar();

    try {
        const r = await postJSON(API.menu.listar, { token: Sesion.token() });
        if (r.ok && r.data) {
            sessionStorage.setItem(APP.keys.menuData, JSON.stringify(r.data));
            renderizarSidebar();
        }
    } catch {  }
}

aplicarEstadoSidebar();
