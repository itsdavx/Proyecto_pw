/* ============================================================
   DASHBOARD.JS — Página de inicio: saludo, accesos rápidos
   personalizables por usuario, frase motivadora y estadísticas.
   ============================================================ */

let _accesosOcultos = [];   // ids de menú que el usuario decidió ocultar
let _itemsAccesos   = [];   // ItemMenus con URL permitidos al rol

document.addEventListener('DOMContentLoaded', async () => {
    const ok = await Router.proteger();
    if (!ok) return;

    mostrarBienvenida();
    cargarAccesosRapidos();
    mostrarFrase();
    cargarEstadisticasFacturacion();

    /* Estadísticas e información administrativa: solo Administrador */
    if (Sesion.usuario()?.id_rol === 1) {
        cargarEstadisticas();
    } else {
        document.getElementById('seccionStats')?.classList.add('d-none');
    }

    document.getElementById('btnPersonalizarAccesos')?.addEventListener('click', modoPersonalizarAccesos);
});

function mostrarBienvenida() {
    const user = Sesion.usuario();
    const hora = new Date().getHours();
    let saludo = 'Buenos días';
    if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';
    else if (hora >= 19)         saludo = 'Buenas noches';

    const el = document.getElementById('saludoUsuario');
    if (el) el.textContent = `${saludo}, ${user?.nombre || user?.username || ''}`;

    const fechaEl = document.getElementById('fechaActual');
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    const rolEl = document.getElementById('rolUsuario');
    if (rolEl) rolEl.textContent = user?.rol || '';
}

/* ── Accesos rápidos personalizables ─────────────────────────── */
async function cargarAccesosRapidos() {
    _itemsAccesos = Sesion.menuData().filter(m => m.url && m.modulo !== 'dashboard');
    try {
        const r = await postJSON(API.dashboard.accesos, { token: Sesion.token() });
        if (r.ok) _accesosOcultos = (r.data || []).map(Number);
    } catch { /* sin configuración: se muestran todos */ }
    renderAccesosRapidos();
}

function renderAccesosRapidos() {
    const cont = document.getElementById('accesosRapidos');
    if (!cont) return;
    const visibles = _itemsAccesos.filter(m => !_accesosOcultos.includes(Number(m.id_menu)));
    cont.innerHTML = visibles.map(m => `
        <a href="${esc(m.url)}" class="btn btn-outline">
            ${resolverIcono(m.icono)} ${esc(m.nombre)}
        </a>`).join('')
        || '<span class="text-muted">No hay accesos rápidos visibles. Use "Personalizar" para activarlos.</span>';
}

function modoPersonalizarAccesos() {
    const cont = document.getElementById('accesosRapidos');
    if (!cont) return;
    cont.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:.5rem;width:100%">
            ${_itemsAccesos.map(m => `
                <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer">
                    <input type="checkbox" data-acceso="${m.id_menu}"
                        style="width:17px;height:17px;accent-color:var(--primary)"
                        ${_accesosOcultos.includes(Number(m.id_menu)) ? '' : 'checked'}>
                    <span>${resolverIcono(m.icono)} ${esc(m.nombre)}</span>
                </label>`).join('')}
            <div class="btn-group" style="margin-top:.6rem">
                <button class="btn btn-sm btn-primary" id="btnGuardarAccesos">Guardar</button>
                <button class="btn btn-sm btn-secondary" id="btnCancelarAccesos">Cancelar</button>
            </div>
        </div>`;
    document.getElementById('btnGuardarAccesos')?.addEventListener('click', guardarAccesosRapidos);
    document.getElementById('btnCancelarAccesos')?.addEventListener('click', renderAccesosRapidos);
}

async function guardarAccesosRapidos() {
    const ocultos = [];
    document.querySelectorAll('#accesosRapidos input[data-acceso]').forEach(ch => {
        if (!ch.checked) ocultos.push(parseInt(ch.dataset.acceso));
    });
    try {
        const r = await postJSON(API.dashboard.accesosGuardar, { token: Sesion.token(), ocultos });
        if (r.ok) {
            _accesosOcultos = ocultos;
            mostrarAlerta(r.msg, 'ok');
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
    renderAccesosRapidos();
}

/* ── Frase motivadora (solo usuarios no administradores) ─────── */
async function mostrarFrase() {
    if (Sesion.usuario()?.id_rol === 1) return;

    /* Una frase por inicio de sesión: se conserva durante la sesión */
    let f = null;
    try { f = JSON.parse(sessionStorage.getItem(APP.keys.frase)); } catch { /* sin caché */ }

    if (!f || !f.frase) {
        try {
            const r = await postJSON(API.dashboard.frase, { token: Sesion.token() });
            if (r.ok && r.data && r.data.frase) {
                f = r.data;
                sessionStorage.setItem(APP.keys.frase, JSON.stringify(f));
            }
        } catch { /* sin frase disponible */ }
    }
    if (!f || !f.frase) return;

    document.getElementById('fraseTexto').textContent = `"${f.frase}"`;
    document.getElementById('fraseAutor').textContent = f.autor ? `— ${f.autor}` : '';
    document.getElementById('fraseCard')?.classList.remove('d-none');
}

/* ── Conteos exactos por módulo ──────────────────────────────── */
async function cargarEstadisticas() {
    try {
        const r = await postJSON(API.dashboard.estadisticas, { token: Sesion.token() });
        if (!r.ok) return;
        _ponerConteo('statUsuarios', r.data.usuarios);
        _ponerConteo('statRoles',    r.data.roles);
        _ponerConteo('statPermisos', r.data.permisos);
    } catch { /* si falla, se mantienen los guiones */ }
}

function _ponerConteo(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== undefined && valor !== null) el.textContent = valor;
}

/* ── Estadísticas del Módulo de Facturación (todos los roles) ──
   Solo consulta; se obtiene fresca en cada carga del Dashboard,
   por lo que refleja el estado actual sin necesidad de caché. */
async function cargarEstadisticasFacturacion() {
    try {
        const r = await postJSON(API.dashboard.estadisticasFacturacion, { token: Sesion.token() });
        if (!r.ok) return;
        const d = r.data;
        _ponerConteo('statFacturas',        d.facturas_total);
        _ponerConteo('statFacturasHoy',     d.facturas_hoy);
        _ponerConteo('statFacturasMes',     d.facturas_mes);
        _ponerConteo('statClientes',        d.clientes);
        _ponerConteo('statProductos',       d.productos);
        _ponerConteo('statMovimientos',     d.movimientos);
        _ponerConteo('statStockBajo',       d.stock_bajo);
        _ponerConteo('statValorInventario', _money(d.valor_inventario));

        const lbl = document.getElementById('statStockBajoLabel');
        if (lbl && d.umbral_stock_bajo != null) lbl.textContent = `Productos con stock bajo (≤ ${d.umbral_stock_bajo})`;
    } catch { /* si falla, se mantienen los guiones */ }
}

/* Formato monetario USD, consistente con las tablas del sistema */
function _money(valor) {
    return '$' + Number(valor || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
