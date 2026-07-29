// Accesos rápidos ocultos
let _accesosOcultos = [];
let _itemsAccesos   = [];

// Arranque del dashboard
document.addEventListener('DOMContentLoaded', async () => {
    const ok = await Router.proteger();
    if (!ok) return;

    mostrarBienvenida();
    cargarAccesosRapidos();
    mostrarFrase();
    cargarEstadisticasFacturacion();

    // Stats solo para superadmin
    if (Sesion.usuario()?.id_rol === 1) {
        cargarEstadisticas();
    } else {
        document.getElementById('seccionStats')?.classList.add('d-none');
    }

    document.getElementById('btnPersonalizarAccesos')?.addEventListener('click', modoPersonalizarAccesos);
});

// Saludo según la hora
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

// Carga accesos del usuario
async function cargarAccesosRapidos() {
    _itemsAccesos = Sesion.menuData().filter(m => m.url && m.modulo !== 'dashboard');
    try {
        const r = await postJSON(API.dashboard.accesos, { token: Sesion.token() });
        if (r.ok) _accesosOcultos = (r.data || []).map(Number);
    } catch {  }
    renderAccesosRapidos();
}

// Pinta accesos visibles
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

// Casillas para elegir accesos
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

// Guarda accesos ocultos
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

// Frase motivacional cacheada
async function mostrarFrase() {
    if (Sesion.usuario()?.id_rol === 1) return;

    let f = null;
    try { f = JSON.parse(sessionStorage.getItem(APP.keys.frase)); } catch {  }

    if (!f || !f.frase) {
        try {
            const r = await postJSON(API.dashboard.frase, { token: Sesion.token() });
            if (r.ok && r.data && r.data.frase) {
                f = r.data;
                sessionStorage.setItem(APP.keys.frase, JSON.stringify(f));
            }
        } catch {  }
    }
    if (!f || !f.frase) return;

    document.getElementById('fraseTexto').textContent = `"${f.frase}"`;
    document.getElementById('fraseAutor').textContent = f.autor ? `— ${f.autor}` : '';
    document.getElementById('fraseCard')?.classList.remove('d-none');
}

// Conteos de administración
async function cargarEstadisticas() {
    try {
        const r = await postJSON(API.dashboard.estadisticas, { token: Sesion.token() });
        if (!r.ok) return;
        _ponerConteo('statUsuarios', r.data.usuarios);
        _ponerConteo('statRoles',    r.data.roles);
        _ponerConteo('statPermisos', r.data.permisos);
    } catch {  }
}

function _ponerConteo(id, valor) {
    const el = document.getElementById(id);
    if (el && valor !== undefined && valor !== null) el.textContent = valor;
}

// Conteos de facturación
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
    } catch {  }
}

// Formato de moneda
function _money(valor) {
    return '$' + Number(valor || 0).toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
