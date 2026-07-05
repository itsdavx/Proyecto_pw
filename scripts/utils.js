/* ============================================================
   UTILS.JS — Helpers globales: fetch, DOM, alertas, formato
   ============================================================ */

/* ── Mapa de iconos Unicode (reemplaza font-awesome) ────────── */
const ICONOS = {
    'fa-gauge':        '◉',
    'fa-gear':         '⚙',
    'fa-users':        '◈',
    'fa-id-badge':     '◆',
    'fa-lock':         '■',
    'fa-bars':         '≡',
    'fa-list':         '☰',
    'fa-circle-user':  '◐',
    'fa-key':          '⊛',
    'fa-home':         '⌂',
    'fa-chart-bar':    '▦',
    'fa-cog':          '⚙',
    'fa-user':         '◉',
    'fa-shield':       '◆',
    'fa-menu':         '≡',
    'fa-option':       '◇',
    'default':         '▸',
};

function resolverIcono(nombre) {
    return ICONOS[nombre] || ICONOS['default'];
}

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
