// Iconos Unicode sin dependencias
const ICONOS = {
    'fa-gauge':        '🏠︎',
    'fa-gear':         '⚙︎',
    'fa-users':        '👥︎',
    'fa-id-badge':     '⛨',
    'fa-lock':         '🔒︎',
    'fa-bars':         '≡',
    'fa-list':         '📋︎',
    'fa-circle-user':  '👤︎',
    'fa-key':          '🔑︎',
    'fa-home':         '🏠︎',
    'fa-chart-bar':    '📊︎',
    'fa-file-invoice': '📄︎',
    'fa-box':          '📦︎',
    'fa-address-book': '📇︎',
    'fa-cog':          '⚙︎',
    'fa-user':         '👤︎',
    'fa-shield':       '⛨',
    'fa-menu':         '≡',
    'fa-option':       '◇',
    'default':         '▸',
};

// Devuelve icono o predeterminado
function resolverIcono(nombre) {
    return ICONOS[nombre] || ICONOS['default'];
}

// Tarifas IVA del SRI
const CATALOGO_IVA = {
    '0': { nombre: '0%',                    tarifa: 0.00 },
    '4': { nombre: '15%',                   tarifa: 15.00 },
    '6': { nombre: 'No objeto de impuesto', tarifa: 0.00 },
    '7': { nombre: 'Exento de IVA',          tarifa: 0.00 },
};

// Impuestos especiales ICE/IRBPNR
const CATALOGO_IMPUESTO_ESPECIAL = {
    '':  { nombre: 'No posee' },
    '3': { nombre: 'ICE — Impuesto a los Consumos Especiales' },
    '5': { nombre: 'IRBPNR — Impuesto a las Botellas Plásticas No Retornables' },
};

// POST JSON al servidor
async function postJSON(url, datos) {
    const resp = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datos),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

let _alertaTimer = null;

// Alerta flotante temporal
function mostrarAlerta(mensaje, tipo = 'ok') {
    let el = document.getElementById('alerta-global');
    if (!el) {
        el = document.createElement('div');
        el.id = 'alerta-global';
        document.body.appendChild(el);
    }

    el.className = '';
    el.classList.add(`alerta-${tipo}`, 'visible');
    el.textContent = mensaje;

    clearTimeout(_alertaTimer);
    _alertaTimer = setTimeout(() => {
        el.classList.remove('visible');
    }, 4000);
}

// Muestra u oculta spinner
function mostrarCargando(visible) {
    let el = document.getElementById('loading-overlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'loading-overlay';
        el.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(el);
    }
    el.classList.toggle('d-none', !visible);
}

// Parámetro de la URL
function getParam(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}

// Fecha ISO a dd/mm/aaaa
function formatFecha(iso) {
    if (!iso) return '—';
    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (soloFecha) return `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}`;
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES');
}

// Escapa HTML contra XSS
function esc(txt) {
    return String(txt ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function confirmar(mensaje) {
    return window.confirm(mensaje);
}

// Activa las pestañas
function inicializarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });
}

// Cambia pestaña visible
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('activo', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('d-none', p.id !== tabId));
}

// Renumera filas visibles
function renumerarFilas(tbody) {
    if (!tbody) return;
    let n = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
        if (tr.style.display === 'none') return;
        const celda = tr.querySelector('td.col-num');
        if (celda) celda.textContent = ++n;
    });
}
