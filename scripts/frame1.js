/* ============================================================
   FRAME1.JS — Registrar movimientos: historial de comprobantes
   electrónicos (Tabla 3 de la Ficha Técnica SRI v2.32) y de
   movimientos de inventario registrados en el sistema.
   Vista de solo lectura; el acceso se controla con frame1/leer.
   ============================================================ */

let _movTipos        = {};
let _movComprobantes = [];
let _movInventario   = [];

async function iniciarFrame1() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame1', 'leer')) return;

    inicializarTabs();
    document.getElementById('selFiltroTipo')?.addEventListener('change', renderizarComprobantes);

    await cargarMovimientos();
}

async function cargarMovimientos() {
    try {
        const r = await postJSON(API.movimientos.listar, { token: Sesion.token() });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }
        _movTipos        = r.data.tipos        || {};
        _movComprobantes = r.data.comprobantes || [];
        _movInventario   = r.data.inventario   || [];
        llenarFiltroTipos();
        renderizarComprobantes();
        renderizarInventario();
    } catch { mostrarAlerta('Error al cargar los movimientos.', 'error'); }
}

/* ── Filtro por tipo de comprobante (Tabla 3 SRI) ────────────── */
function llenarFiltroTipos() {
    const sel = document.getElementById('selFiltroTipo');
    if (!sel) return;
    const seleccionado = sel.value;
    sel.innerHTML = '<option value="">Todos los tipos</option>' +
        Object.entries(_movTipos)
            .map(([cod, nombre]) => `<option value="${cod}">${cod} — ${esc(nombre)}</option>`)
            .join('');
    if (seleccionado && [...sel.options].some(o => o.value === seleccionado)) {
        sel.value = seleccionado;
    }
}

/* ── Comprobantes electrónicos ───────────────────────────────── */
function renderizarComprobantes() {
    const tbody = document.getElementById('tbodyComprobantes');
    if (!tbody) return;

    const filtro = document.getElementById('selFiltroTipo')?.value || '';
    const lista  = filtro ? _movComprobantes.filter(c => c.cod_doc === filtro) : _movComprobantes;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="tabla-vacia">${
            filtro ? 'No hay comprobantes registrados de este tipo.' : 'No hay comprobantes registrados.'
        }</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map((c, i) => `
        <tr>
            <td class="col-num">${i + 1}</td>
            <td><span class="badge badge-primary">${esc(c.cod_doc)}</span> ${esc(c.tipo)}</td>
            <td>${esc(c.documento)}<br><span class="text-muted" style="font-size:.72rem" title="Clave de acceso">${esc(c.clave_acceso)}</span></td>
            <td>${formatFecha(c.fecha_emision)}</td>
            <td>${esc(c.receptor)}<br><span class="text-muted">${esc(c.identificacion_receptor)}</span></td>
            <td><strong>$${Number(c.importe_total).toFixed(2)}</strong></td>
            <td><span class="badge ${c.ambiente == 2 ? 'badge-activo' : 'badge-warning'}">${c.ambiente == 2 ? 'Producción' : 'Pruebas'}</span> <span class="badge badge-primary">${esc(c.estado)}</span></td>
            <td>${esc(c.registrado_por || '—')}</td>
        </tr>
    `).join('');
    renumerarFilas(tbody);
}

/* ── Movimientos de inventario ───────────────────────────────── */
function renderizarInventario() {
    const tbody = document.getElementById('tbodyInventario');
    if (!tbody) return;

    if (_movInventario.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="tabla-vacia">No hay movimientos de inventario registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = _movInventario.map((m, i) => `
        <tr>
            <td class="col-num">${i + 1}</td>
            <td>${formatFecha(m.fecha_emision)}</td>
            <td>${esc(m.codigo_principal)}</td>
            <td>${esc(m.descripcion)}</td>
            <td><span class="badge badge-warning">${esc(m.tipo_movimiento)}</span></td>
            <td>${Number(m.cantidad).toFixed(2)} ${esc(m.unidad || '')}</td>
            <td>${esc(m.documento)}</td>
        </tr>
    `).join('');
    renumerarFilas(tbody);
}
