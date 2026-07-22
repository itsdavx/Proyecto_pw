/* ============================================================
   FRAME2.JS — Facturación Electrónica SRI (Ecuador): listado de
   facturas (codDoc 01), emisión con descuento porcentual por
   línea, datos del emisor y descarga de XML / PDF (RIDE).

   Los clientes y los productos se administran en sus propios
   módulos (Clientes e Inventario); aquí solo se consumen sus
   listados como fuente única de datos para la Nueva Factura.

   Catálogos duplicados aquí solo para previsualización en el
   cliente. La fuente de verdad y el cálculo autoritativo residen
   en servidor/facturacion/lib/ — el servidor recalcula todo al
   generar la factura, sin confiar en estos valores del navegador.
   ============================================================ */

const FRAME2_FORMA_PAGO = {
    '01': 'Sin utilización del sistema financiero',
    '15': 'Compensación de deudas',
    '16': 'Tarjeta de débito',
    '17': 'Dinero electrónico',
    '18': 'Tarjeta prepago',
    '19': 'Tarjeta de crédito',
    '20': 'Otros con utilización del sistema financiero',
    '21': 'Endoso de títulos',
};

let _clientes     = [];
let _productos    = [];
let _facturas     = [];
let _itemsFactura = [];
let _itemUidSeq   = 0;

/* ── Inicio ──────────────────────────────────────────────────── */
async function iniciarFrame2() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame2', 'leer')) return;

    if (!Sesion.tienePermiso('frame2', 'crear'))  document.getElementById('cardNuevaFactura')?.classList.add('d-none');
    if (!Sesion.tienePermiso('frame2', 'editar')) document.getElementById('btnGuardarEmisor')?.classList.add('d-none');

    inicializarTabs();
    llenarSelect('selFormaPago', FRAME2_FORMA_PAGO, (cod, nombre) => `${cod} — ${nombre}`);

    await Promise.all([cargarClientes(), cargarProductos(), cargarFacturas(), cargarEmisor()]);

    agregarFilaItem();

    document.getElementById('formEmisor')?.addEventListener('submit', submitEmisor);
    document.getElementById('formFactura')?.addEventListener('submit', submitFactura);
    document.getElementById('btnAgregarItem')?.addEventListener('click', agregarFilaItem);
    document.getElementById('txtPropina')?.addEventListener('input', recalcularTotalesFactura);
}

function llenarSelect(id, opciones, formato) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = Object.entries(opciones)
        .map(([cod, val]) => `<option value="${cod}">${esc(formato ? formato(cod, val) : val)}</option>`)
        .join('');
}

/* ── Fuentes de datos (módulos Clientes e Inventario) ────────── */
async function cargarClientes() {
    try {
        const r = await postJSON(API.clientes.listar, { token: Sesion.token() });
        if (r.ok) { _clientes = r.data; llenarSelectClientesFactura(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar clientes.', 'error'); }
}

async function cargarProductos() {
    try {
        const r = await postJSON(API.inventario.listar, { token: Sesion.token() });
        if (r.ok) { _productos = r.data.productos || []; renderizarItemsFactura(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar productos.', 'error'); }
}

function llenarSelectClientesFactura() {
    const sel = document.getElementById('selCliente');
    if (!sel) return;
    const seleccionado = sel.value; // conservar la selección al refrescar la lista
    sel.innerHTML = _clientes
        .filter(c => c.estado == 1)
        .map(c => `<option value="${c.id_cliente}">${esc(c.identificacion)} — ${esc(c.razon_social)}</option>`)
        .join('');
    if (seleccionado && [...sel.options].some(o => o.value === seleccionado)) {
        sel.value = seleccionado;
    }
}

/* ── Emisor ──────────────────────────────────────────────────── */
async function cargarEmisor() {
    try {
        const r = await postJSON(API.frame2.emisorObtener, { token: Sesion.token() });
        if (r.ok && r.data && r.data.id_emisor) {
            const em = r.data;
            document.getElementById('txtRucEmisor').value = em.ruc;
            document.getElementById('txtRazonSocialEmisor').value = em.razon_social;
            document.getElementById('txtNombreComercialEmisor').value = em.nombre_comercial || '';
            document.getElementById('txtDirMatrizEmisor').value = em.dir_matriz;
            document.getElementById('selAmbienteEmisor').value = em.ambiente;
            document.getElementById('selTipoEmisionEmisor').value = em.tipo_emision;
            document.getElementById('txtEstablecimientoEmisor').value = em.establecimiento;
            document.getElementById('txtPtoEmisionEmisor').value = em.punto_emision;
            document.getElementById('selObligadoEmisor').value = em.obligado_contabilidad;
            document.getElementById('txtContribuyenteEmisor').value = em.contribuyente_especial || '';
        }
    } catch { mostrarAlerta('Error al cargar los datos del emisor.', 'error'); }
}

async function submitEmisor(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const ruc         = document.getElementById('txtRucEmisor');
    const razonSocial = document.getElementById('txtRazonSocialEmisor');
    const dirMatriz    = document.getElementById('txtDirMatrizEmisor');
    if (!Validaciones.requerido(ruc, 'RUC')) return;
    if (!Validaciones.requerido(razonSocial, 'Razón social')) return;
    if (!Validaciones.requerido(dirMatriz, 'Dirección matriz')) return;

    if (!Sesion.tienePermiso('frame2', 'editar')) {
        mostrarAlerta('No tiene permiso para editar los datos del emisor.', 'error');
        return;
    }

    const datos = {
        token:                   Sesion.token(),
        ruc:                     ruc.value.trim(),
        razon_social:            razonSocial.value.trim(),
        nombre_comercial:        document.getElementById('txtNombreComercialEmisor').value.trim(),
        dir_matriz:              dirMatriz.value.trim(),
        ambiente:                document.getElementById('selAmbienteEmisor').value,
        tipo_emision:            document.getElementById('selTipoEmisionEmisor').value,
        establecimiento:         document.getElementById('txtEstablecimientoEmisor').value.trim(),
        punto_emision:           document.getElementById('txtPtoEmisionEmisor').value.trim(),
        obligado_contabilidad:   document.getElementById('selObligadoEmisor').value,
        contribuyente_especial:  document.getElementById('txtContribuyenteEmisor').value.trim(),
    };

    try {
        const r = await postJSON(API.frame2.emisorGuardar, datos);
        mostrarAlerta(r.msg, r.ok ? 'ok' : 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Facturas (listado + descargas XML / PDF) ────────────────── */
async function cargarFacturas() {
    try {
        const r = await postJSON(API.frame2.facturasListar, { token: Sesion.token() });
        if (r.ok) { _facturas = r.data; renderizarTablaFacturas(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar facturas.', 'error'); }
}

function renderizarTablaFacturas() {
    const tbody = document.getElementById('tbodyFacturas');
    if (!tbody) return;

    if (_facturas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="tabla-vacia">No hay facturas generadas.</td></tr>`;
        return;
    }

    tbody.innerHTML = _facturas.map((f, i) => `
        <tr>
            <td class="col-num">${i + 1}</td>
            <td>${esc(f.establecimiento)}-${esc(f.punto_emision)}-${esc(f.secuencial)}</td>
            <td>${formatFecha(f.fecha_emision)}</td>
            <td>${esc(f.razon_social_comprador)}<br><span class="text-muted">${esc(f.identificacion_comprador)}</span></td>
            <td>$${Number(f.total_sin_impuestos).toFixed(2)}</td>
            <td>$${Number(f.total_iva).toFixed(2)}</td>
            <td><strong>$${Number(f.importe_total).toFixed(2)}</strong></td>
            <td><span class="badge badge-primary">${esc(f.estado)}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="descargarXmlFactura(${f.id_factura})" aria-label="Descargar XML de la factura">XML</button>
                    <button class="btn btn-sm btn-outline" onclick="descargarPdfFactura(${f.id_factura})" aria-label="Descargar PDF de la factura">PDF</button>
                </div>
            </td>
        </tr>
    `).join('');
    renumerarFilas(tbody);
}

function _descargarArchivo(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

async function descargarXmlFactura(id) {
    try {
        const r = await postJSON(API.frame2.facturasObtener, { token: Sesion.token(), id_factura: id });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        const blob = new Blob([r.data.factura.xml_generado], { type: 'application/xml' });
        _descargarArchivo(blob, `factura_${r.data.factura.clave_acceso}.xml`);
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

async function descargarPdfFactura(id) {
    try {
        const r = await postJSON(API.frame2.facturasPdf, { token: Sesion.token(), id_factura: id });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        // El endpoint entrega el PDF (RIDE) en base64 dentro del JSON,
        // siguiendo el mismo patrón de descarga que el XML.
        const bin   = atob(r.data.pdf_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        _descargarArchivo(new Blob([bytes], { type: 'application/pdf' }), `factura_${r.data.clave_acceso}.pdf`);
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Nueva Factura: detalle dinámico y cálculo en vivo ────────
   El descuento de cada línea es un PORCENTAJE (0-100); el valor
   monetario se calcula automáticamente sobre el subtotal de la
   línea y el servidor lo recalcula al emitir. */
function agregarFilaItem() {
    _itemsFactura.push({ uid: ++_itemUidSeq, id_producto: '', cantidad: 1, descuento_pct: 0 });
    renderizarItemsFactura();
}

function quitarFilaItem(uid) {
    _itemsFactura = _itemsFactura.filter(it => it.uid !== uid);
    if (_itemsFactura.length === 0) agregarFilaItem();
    else renderizarItemsFactura();
}

function actualizarItem(uid, campo, valor) {
    const it = _itemsFactura.find(x => x.uid === uid);
    if (!it) return;
    it[campo] = campo === 'id_producto' ? valor : (parseFloat(valor) || 0);
    renderizarItemsFactura();
}

function _calcularLineaPreview(it) {
    const producto = _productos.find(p => p.id_producto == it.id_producto && p.estado == 1);
    const iva      = producto ? (CATALOGO_IVA[producto.codigo_porcentaje_iva] || { tarifa: 0 }) : { tarifa: 0 };
    const precio   = producto ? Number(producto.precio_unitario) : 0;
    const bruto    = it.cantidad * precio;
    const pct      = Math.min(100, Math.max(0, it.descuento_pct));
    const descuentoMonto = bruto * pct / 100;
    const subtotal = Math.max(0, bruto - descuentoMonto);
    const valorIva = subtotal * (iva.tarifa / 100);
    return { descuentoMonto, subtotal, valorIva, total: subtotal + valorIva };
}

function renderizarItemsFactura() {
    const tbody = document.getElementById('tbodyItems');
    if (!tbody) return;

    const productosActivos = _productos.filter(p => p.estado == 1);

    tbody.innerHTML = _itemsFactura.length === 0
        ? `<tr><td colspan="7" class="tabla-vacia">Sin ítems. Agregue al menos uno.</td></tr>`
        : _itemsFactura.map(it => {
            const { descuentoMonto, subtotal, valorIva, total } = _calcularLineaPreview(it);
            const prod = _productos.find(p => p.id_producto == it.id_producto && p.estado == 1);
            const info = prod
                ? `${esc(prod.categoria || 'Sin categoría')} · ${esc(prod.unidad)} (${esc(prod.unidad_abrev)}) · Stock: ${Number(prod.stock).toFixed(2)}`
                : '';
            return `
                <tr>
                    <td>
                        <select class="form-control" onchange="actualizarItem(${it.uid}, 'id_producto', this.value)">
                            <option value="">Seleccione...</option>
                            ${productosActivos.map(p => `<option value="${p.id_producto}" ${p.id_producto == it.id_producto ? 'selected' : ''}>${esc(p.codigo_principal)} — ${esc(p.descripcion)} [${esc(p.unidad_abrev)}]</option>`).join('')}
                        </select>
                        ${info ? `<div class="text-muted" style="font-size:.72rem;margin-top:.25rem">${info}</div>` : ''}
                    </td>
                    <td>
                        <input class="form-control" type="number" min="0.000001" step="0.000001" value="${it.cantidad}" onchange="actualizarItem(${it.uid}, 'cantidad', this.value)" ${prod ? `aria-label="Cantidad en ${esc(prod.unidad)}"` : ''}>
                        ${prod ? `<div class="text-muted" style="font-size:.72rem;margin-top:.25rem">${esc(prod.unidad_abrev)}</div>` : ''}
                    </td>
                    <td>
                        <input class="form-control" type="number" min="0" max="100" step="0.01" value="${it.descuento_pct}" onchange="actualizarItem(${it.uid}, 'descuento_pct', this.value)" aria-label="Porcentaje de descuento (0 a 100)">
                        <div class="text-muted" style="font-size:.72rem;margin-top:.25rem">−$${descuentoMonto.toFixed(2)}</div>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>$${valorIva.toFixed(2)}</td>
                    <td><strong>$${total.toFixed(2)}</strong></td>
                    <td><button type="button" class="btn btn-sm btn-danger" onclick="quitarFilaItem(${it.uid})">✕</button></td>
                </tr>
            `;
        }).join('');

    recalcularTotalesFactura();
}

function recalcularTotalesFactura() {
    let subtotalGeneral = 0, descuentoGeneral = 0, ivaGeneral = 0;

    _itemsFactura.forEach(it => {
        const { descuentoMonto, subtotal, valorIva } = _calcularLineaPreview(it);
        subtotalGeneral  += subtotal;
        descuentoGeneral += descuentoMonto;
        ivaGeneral       += valorIva;
    });

    const propina = parseFloat(document.getElementById('txtPropina')?.value) || 0;

    document.getElementById('totSubtotal').textContent  = subtotalGeneral.toFixed(2);
    document.getElementById('totDescuento').textContent = descuentoGeneral.toFixed(2);
    document.getElementById('totIva').textContent       = ivaGeneral.toFixed(2);
    document.getElementById('totImporte').textContent   = (subtotalGeneral + ivaGeneral + propina).toFixed(2);
}

async function submitFactura(e) {
    e.preventDefault();

    if (!Sesion.tienePermiso('frame2', 'crear')) {
        mostrarAlerta('No tiene permiso para generar facturas.', 'error');
        return;
    }

    const idCliente = document.getElementById('selCliente').value;
    if (!idCliente) { mostrarAlerta('Debe seleccionar un cliente.', 'error'); return; }

    const items = _itemsFactura.filter(it => it.id_producto && it.cantidad > 0);
    if (items.length === 0) { mostrarAlerta('Debe agregar al menos un ítem válido al detalle.', 'error'); return; }

    if (items.some(it => it.descuento_pct < 0 || it.descuento_pct > 100)) {
        mostrarAlerta('El descuento de cada ítem debe ser un porcentaje entre 0 y 100.', 'error');
        return;
    }

    const datos = {
        token:      Sesion.token(),
        id_cliente: idCliente,
        forma_pago: document.getElementById('selFormaPago').value,
        propina:    parseFloat(document.getElementById('txtPropina').value) || 0,
        items:      items.map(it => ({ id_producto: it.id_producto, cantidad: it.cantidad, descuento_pct: it.descuento_pct })),
    };

    try {
        const r = await postJSON(API.frame2.facturasCrear, datos);
        if (r.ok) {
            mostrarAlerta(`${r.msg} Clave de acceso: ${r.data.clave_acceso}`, 'ok');
            _itemsFactura = [];
            agregarFilaItem();
            document.getElementById('formFactura')?.reset();
            await Promise.all([cargarFacturas(), cargarProductos()]); // el stock cambió
            cambiarTab('tabFacturas');
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
