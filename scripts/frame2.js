// Formas de pago SRI
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

// Facturas e ítems actuales
let _facturas     = [];
let _itemsFactura = [];
let _itemUidSeq   = 0;
let _pagFacturas  = null;

// Arranca módulo de facturación
async function iniciarFrame2() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame2', 'leer')) return;

    // Oculta según permisos
    if (!Sesion.tienePermiso('frame2', 'crear'))  document.getElementById('cardNuevaFactura')?.classList.add('d-none');
    if (!Sesion.tienePermiso('frame2', 'editar')) document.getElementById('btnGuardarEmisor')?.classList.add('d-none');

    inicializarTabs();
    llenarSelect('selFormaPago', FRAME2_FORMA_PAGO, (cod, nombre) => `${cod} — ${nombre}`);
    inicializarAutocompleteCliente();
    inicializarAutocompleteProductos();
    _pagFacturas = crearPaginador({ clave: 'facturas', tbodyId: 'tbodyFacturas', etiqueta: 'facturas', pintar: _pintarFacturas });

    await Promise.all([cargarFacturas(), cargarEmisor()]);

    agregarFilaItem();

    document.getElementById('formEmisor')?.addEventListener('submit', submitEmisor);
    document.getElementById('formFactura')?.addEventListener('submit', submitFactura);
    document.getElementById('btnAgregarItem')?.addEventListener('click', agregarFilaItem);
    document.getElementById('txtPropina')?.addEventListener('input', recalcularTotalesFactura);

    ['txtBuscarFactura', 'txtFechaDesdeFactura', 'txtFechaHastaFactura']
        .forEach(id => document.getElementById(id)?.addEventListener('input', () => renderizarTablaFacturas(true)));
    ['selFiltroAmbienteFactura', 'selFiltroEstadoFactura']
        .forEach(id => document.getElementById(id)?.addEventListener('change', () => renderizarTablaFacturas(true)));
}

// Llena un select
function llenarSelect(id, opciones, formato) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = Object.entries(opciones)
        .map(([cod, val]) => `<option value="${cod}">${esc(formato ? formato(cod, val) : val)}</option>`)
        .join('');
}

// Retardo de búsqueda
let _clienteBuscarTimer = null;

let _autocompleteContexto = null;

// Overlay único reutilizable
function _overlayAutocomplete() {
    let overlay = document.getElementById('autocompleteOverlay');
    if (overlay && !overlay.dataset.listo) {
        overlay.dataset.listo = '1';
        overlay.addEventListener('click', e => {
            const item = e.target.closest('.autocomplete-item');
            if (!item || !_autocompleteContexto) return;
            if (_autocompleteContexto.tipo === 'cliente') {
                const c = _autocompleteContexto.resultados.find(x => x.id_cliente == item.dataset.id);
                if (c) seleccionarClienteFactura(c);
            } else {
                const p = _autocompleteContexto.resultados.find(x => x.id_producto == item.dataset.id);
                if (p) seleccionarProductoFactura(_autocompleteContexto.uid, p);
            }
        });
        document.addEventListener('scroll', _cerrarAutocomplete, true);
        window.addEventListener('resize', _cerrarAutocomplete);
        document.addEventListener('click', e => {
            if (overlay.classList.contains('d-none')) return;
            if (!e.target.closest('.autocomplete-wrap') && !e.target.closest('#autocompleteOverlay')) {
                _cerrarAutocomplete();
            }
        });
    }
    return overlay;
}

// Cierra el desplegable
function _cerrarAutocomplete() {
    const overlay = document.getElementById('autocompleteOverlay');
    if (!overlay) return;
    overlay.classList.add('d-none');
    overlay.innerHTML = '';
    _autocompleteContexto = null;
}

// Posiciona junto al campo
function _abrirAutocompleteJunto(inputEl) {
    const overlay = _overlayAutocomplete();
    const r = inputEl.getBoundingClientRect();
    overlay.style.top   = `${r.bottom + 4}px`;
    overlay.style.left  = `${r.left}px`;
    overlay.style.width = `${r.width}px`;
    return overlay;
}

// Autocompletado de cliente
function inicializarAutocompleteCliente() {
    const input  = document.getElementById('txtBuscarClienteFactura');
    const oculto = document.getElementById('selCliente');
    if (!input || !oculto) return;

    input.addEventListener('input', () => {
        oculto.value = '';
        const texto = input.value.trim();
        clearTimeout(_clienteBuscarTimer);
        if (texto.length < 2) { _cerrarAutocomplete(); return; }
        _clienteBuscarTimer = setTimeout(() => buscarClientesFactura(input, texto), 250);
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Escape') _cerrarAutocomplete();
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('autocompleteOverlay')?.querySelector('.autocomplete-item')?.click();
        }
    });
}

// Busca clientes activos
async function buscarClientesFactura(input, texto) {
    try {
        const r = await postJSON(API.clientes.listar, { token: Sesion.token(), busqueda: texto, limite: 20 });
        _pintarListaClientesFactura(input, r.ok ? r.data.filter(c => c.estado == 1) : []);
    } catch { _pintarListaClientesFactura(input, []); }
}

// Pinta resultados de clientes
function _pintarListaClientesFactura(input, resultados) {
    if (!document.body.contains(input)) return;
    const overlay = _abrirAutocompleteJunto(input);
    _autocompleteContexto = { tipo: 'cliente', resultados };
    overlay.innerHTML = resultados.length
        ? resultados.map(c => `<div class="autocomplete-item" data-id="${c.id_cliente}">${esc(c.identificacion)} — ${esc(c.razon_social)}</div>`).join('')
        : `<div class="autocomplete-vacio">Sin coincidencias.</div>`;
    overlay.classList.remove('d-none');
}

// Fija el cliente elegido
function seleccionarClienteFactura(c) {
    document.getElementById('selCliente').value = c.id_cliente;
    document.getElementById('txtBuscarClienteFactura').value = `${c.identificacion} — ${c.razon_social}`;
    _cerrarAutocomplete();
}

// Retardo por fila
let _productoBuscarTimers = {};

// Autocompletado de productos
function inicializarAutocompleteProductos() {
    const tbody = document.getElementById('tbodyItems');
    if (!tbody) return;

    tbody.addEventListener('input', e => {
        const input = e.target.closest('.producto-buscar');
        if (!input) return;
        const uid = Number(input.dataset.uid);
        const it  = _itemsFactura.find(x => x.uid === uid);
        if (it) { it.id_producto = ''; it.producto = null; recalcularTotalesFactura(); }

        clearTimeout(_productoBuscarTimers[uid]);
        const texto = input.value.trim();
        if (texto.length < 2) { _cerrarAutocomplete(); return; }
        _productoBuscarTimers[uid] = setTimeout(() => buscarProductosFactura(input, uid, texto), 250);
    });

    tbody.addEventListener('keydown', e => {
        const input = e.target.closest('.producto-buscar');
        if (!input) return;
        if (e.key === 'Escape') _cerrarAutocomplete();
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('autocompleteOverlay')?.querySelector('.autocomplete-item')?.click();
        }
    });
}

// Busca productos activos
async function buscarProductosFactura(input, uid, texto) {
    try {
        const r = await postJSON(API.inventario.listar, { token: Sesion.token(), busqueda: texto, limite: 20 });
        const resultados = r.ok ? (r.data.productos || []).filter(p => p.estado == 1) : [];
        _pintarListaProductosFactura(input, uid, resultados);
    } catch { _pintarListaProductosFactura(input, uid, []); }
}

// Pinta resultados de productos
function _pintarListaProductosFactura(input, uid, resultados) {
    if (!document.body.contains(input)) return;
    const overlay = _abrirAutocompleteJunto(input);
    _autocompleteContexto = { tipo: 'producto', uid, resultados };
    overlay.innerHTML = resultados.length
        ? resultados.map(p => `<div class="autocomplete-item" data-id="${p.id_producto}">${esc(p.codigo_principal)} — ${esc(p.descripcion)} [${esc(p.unidad_abrev)}]</div>`).join('')
        : `<div class="autocomplete-vacio">Sin coincidencias.</div>`;
    overlay.classList.remove('d-none');
}

// Fija producto de la fila
function seleccionarProductoFactura(uid, p) {
    const it = _itemsFactura.find(x => x.uid === uid);
    if (!it) return;
    it.id_producto = p.id_producto;
    it.producto    = p;
    _cerrarAutocomplete();
    renderizarItemsFactura();
}

// Carga datos del emisor
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

// Valida y guarda emisor
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

// Pide facturas al servidor
async function cargarFacturas() {
    try {
        const r = await postJSON(API.frame2.facturasListar, { token: Sesion.token() });
        if (r.ok) { _facturas = r.data; llenarFiltroEstadoFactura(); renderizarTablaFacturas(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar facturas.', 'error'); }
}

// Estados presentes en datos
function llenarFiltroEstadoFactura() {
    const sel = document.getElementById('selFiltroEstadoFactura');
    if (!sel) return;
    const previo = sel.value;
    const estados = [...new Set(_facturas.map(f => f.estado))].sort();
    sel.innerHTML = '<option value="">Todos los estados</option>' +
        estados.map(e => `<option value="${esc(e)}">${esc(e)}</option>`).join('');
    if (previo && [...sel.options].some(o => o.value === previo)) sel.value = previo;
}

// Filtra y pagina facturas
function renderizarTablaFacturas(reiniciar = false) {
    const busqueda      = (document.getElementById('txtBuscarFactura')?.value || '').toLowerCase().trim();
    const filtroAmbiente = document.getElementById('selFiltroAmbienteFactura')?.value || '';
    const filtroEstado   = document.getElementById('selFiltroEstadoFactura')?.value || '';
    const fechaDesde     = document.getElementById('txtFechaDesdeFactura')?.value || '';
    const fechaHasta     = document.getElementById('txtFechaHastaFactura')?.value || '';

    const lista = _facturas.filter(f => {
        if (filtroAmbiente && String(f.ambiente) !== filtroAmbiente) return false;
        if (filtroEstado && f.estado !== filtroEstado) return false;
        if (fechaDesde && f.fecha_emision < fechaDesde) return false;
        if (fechaHasta && f.fecha_emision > fechaHasta) return false;
        if (busqueda) {
            const documento = `${f.establecimiento}-${f.punto_emision}-${f.secuencial}`;
            const texto = `${documento} ${f.razon_social_comprador} ${f.identificacion_comprador} ${f.clave_acceso}`.toLowerCase();
            if (!texto.includes(busqueda)) return false;
        }
        return true;
    });
    _pagFacturas.render(lista, { reiniciar });
}

// Pinta filas de facturas
function _pintarFacturas(lista) {
    const tbody = document.getElementById('tbodyFacturas');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="tabla-vacia">No hay facturas que coincidan con el filtro.</td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(f => `
        <tr>
            <td>${esc(f.establecimiento)}-${esc(f.punto_emision)}-${esc(f.secuencial)}</td>
            <td>${formatFecha(f.fecha_emision)}</td>
            <td>${esc(f.razon_social_comprador)}<br><span class="text-muted">${esc(f.identificacion_comprador)}</span></td>
            <td>$${Number(f.total_sin_impuestos).toFixed(2)}</td>
            <td>$${Number(f.total_iva).toFixed(2)}</td>
            <td><strong>$${Number(f.importe_total).toFixed(2)}</strong></td>
            <td><span class="badge ${f.ambiente == 2 ? 'badge-activo' : 'badge-warning'}">${f.ambiente == 2 ? 'Producción' : 'Pruebas'}</span> <span class="badge badge-primary">${esc(f.estado)}</span></td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" onclick="descargarXmlFactura(${f.id_factura})" aria-label="Descargar XML de la factura">XML</button>
                    <button class="btn btn-sm btn-outline" onclick="descargarPdfFactura(${f.id_factura})" aria-label="Descargar PDF de la factura">PDF</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Descarga un blob
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

// Descarga XML de factura
async function descargarXmlFactura(id) {
    try {
        const r = await postJSON(API.frame2.facturasObtener, { token: Sesion.token(), id_factura: id });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        const blob = new Blob([r.data.factura.xml_generado], { type: 'application/xml' });
        _descargarArchivo(blob, `factura_${r.data.factura.clave_acceso}.xml`);
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

// Decodifica base64 y descarga
async function descargarPdfFactura(id) {
    try {
        const r = await postJSON(API.frame2.facturasPdf, { token: Sesion.token(), id_factura: id });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        const bin   = atob(r.data.pdf_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        _descargarArchivo(new Blob([bytes], { type: 'application/pdf' }), `factura_${r.data.clave_acceso}.pdf`);
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

// Añade fila al detalle
function agregarFilaItem() {
    _itemsFactura.push({ uid: ++_itemUidSeq, id_producto: '', cantidad: 1, descuento_pct: 0, producto: null });
    renderizarItemsFactura();
}

// Quita fila del detalle
function quitarFilaItem(uid) {
    _itemsFactura = _itemsFactura.filter(it => it.uid !== uid);
    clearTimeout(_productoBuscarTimers[uid]);
    delete _productoBuscarTimers[uid];
    if (_itemsFactura.length === 0) agregarFilaItem();
    else renderizarItemsFactura();
}

// Cambia cantidad o descuento
function actualizarItem(uid, campo, valor) {
    const it = _itemsFactura.find(x => x.uid === uid);
    if (!it) return;
    it[campo] = parseFloat(valor) || 0;
    renderizarItemsFactura();
}

// Cálculo local previo
function _calcularLineaPreview(it) {
    const producto = it.producto && it.producto.estado == 1 ? it.producto : null;
    const iva      = producto ? (CATALOGO_IVA[producto.codigo_porcentaje_iva] || { tarifa: 0 }) : { tarifa: 0 };
    const precio   = producto ? Number(producto.precio_unitario) : 0;
    const bruto    = it.cantidad * precio;
    const pct      = Math.min(100, Math.max(0, it.descuento_pct));
    const descuentoMonto = bruto * pct / 100;
    const subtotal = Math.max(0, bruto - descuentoMonto);
    const valorIva = subtotal * (iva.tarifa / 100);
    return { descuentoMonto, subtotal, valorIva, total: subtotal + valorIva };
}

// Pinta el detalle
function renderizarItemsFactura() {
    const tbody = document.getElementById('tbodyItems');
    if (!tbody) return;

    _cerrarAutocomplete();

    tbody.innerHTML = _itemsFactura.length === 0
        ? `<tr><td colspan="7" class="tabla-vacia">Sin ítems. Agregue al menos uno.</td></tr>`
        : _itemsFactura.map(it => {
            const { descuentoMonto, subtotal, valorIva, total } = _calcularLineaPreview(it);
            const prod = it.producto;
            const info = prod
                ? `${esc(prod.categoria || 'Sin categoría')} · ${esc(prod.unidad)} (${esc(prod.unidad_abrev)}) · Stock: ${Number(prod.stock).toFixed(2)}`
                : '';
            const textoProducto = prod ? `${prod.codigo_principal} — ${prod.descripcion}` : '';
            return `
                <tr>
                    <td>
                        <div class="autocomplete-wrap">
                            <input class="form-control producto-buscar" type="text" data-uid="${it.uid}" placeholder="Buscar por código o descripción..." autocomplete="off" value="${esc(textoProducto)}">
                        </div>
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

// Suma totales con propina
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

// Valida y emite factura
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
            await cargarFacturas();
            cambiarTab('tabFacturas');
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
