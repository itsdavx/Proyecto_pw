/* ============================================================
   UTILS.JS — Helpers globales: fetch, DOM, alertas, formato
   ============================================================ */

/* ── Mapa de iconos Unicode (reemplaza font-awesome) ──────────
   Los pictogramas llevan el selector de variación U+FE0E (invisible)
   para forzar la presentación de texto monocroma en lugar de emoji
   a color, manteniendo un estilo uniforme. */
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

function resolverIcono(nombre) {
    return ICONOS[nombre] || ICONOS['default'];
}

/* ── Catálogo de IVA vigente (codigoPorcentaje SRI) ──────────────
   Solo para previsualización y formularios del cliente; la fuente
   de verdad está en servidor/facturacion/lib/Catalogos.php. */
const CATALOGO_IVA = {
    '0': { nombre: '0%',                    tarifa: 0.00 },
    '4': { nombre: '15%',                   tarifa: 15.00 },
    '6': { nombre: 'No objeto de impuesto', tarifa: 0.00 },
    '7': { nombre: 'Exento de IVA',          tarifa: 0.00 },
};

/* ── Catálogo de impuestos especiales (Tabla 16 SRI) ─────────────
   Clasificación informativa del producto, además del IVA. La clave
   vacía representa "No posee" (se guarda como NULL en el producto). */
const CATALOGO_IMPUESTO_ESPECIAL = {
    '':  { nombre: 'No posee' },
    '3': { nombre: 'ICE — Impuesto a los Consumos Especiales' },
    '5': { nombre: 'IRBPNR — Impuesto a las Botellas Plásticas No Retornables' },
};

/* ── Petición POST a los endpoints PHP ───────────────────────── */
async function postJSON(url, datos) {
    const resp = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(datos),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}

/* ── Alerta flotante ─────────────────────────────────────────── */
let _alertaTimer = null;

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

/* ── Overlay de carga ────────────────────────────────────────── */
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

/* ── Obtener parámetro de la URL ─────────────────────────────── */
function getParam(nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
}

/* ── Formatear fecha ISO → dd/mm/aaaa ───────────────────────── */
function formatFecha(iso) {
    if (!iso) return '—';
    // Fechas sin hora ('YYYY-MM-DD'): formatear directamente, sin pasar
    // por Date, que las interpreta como UTC y resta un día en zonas GMT-.
    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (soloFecha) return `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}`;
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES');
}

/* ── Escapar HTML para evitar XSS al insertar en innerHTML ────── */
function esc(txt) {
    return String(txt ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ── Confirmar antes de eliminar ─────────────────────────────── */
function confirmar(mensaje) {
    return window.confirm(mensaje);
}

/* ── Pestañas (tabs) ─────────────────────────────────────────────
   Conecta los botones .tab-btn[data-tab] con sus paneles .tab-panel
   (por id). Usado por las páginas con vista en pestañas. */
function inicializarTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
    });
}

function cambiarTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('activo', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('d-none', p.id !== tabId));
}

/* ── Numeración visual (columna N°) ──────────────────────────────
   Renumera consecutivamente (1, 2, 3...) la celda `.col-num` de
   cada fila VISIBLE de una tabla. Es puramente de interfaz: no
   se guarda en la base de datos ni sustituye al ID real. Debe
   invocarse de nuevo tras cualquier render, filtro o búsqueda. */
function renumerarFilas(tbody) {
    if (!tbody) return;
    let n = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
        if (tr.style.display === 'none') return;
        const celda = tr.querySelector('td.col-num');
        if (celda) celda.textContent = ++n;
    });
}
