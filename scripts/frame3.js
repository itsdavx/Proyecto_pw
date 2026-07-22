/* ============================================================
   FRAME3.JS — Inventario: módulo único responsable de los
   productos del sistema — creación, edición, activación,
   eliminación, stock, categorías y unidades de medida — con
   filtro por categoría y búsqueda. Facturación consume esta
   misma fuente de datos (servidor/inventario/listar.php).
   Permisos: frame3 leer / crear / editar / estado / eliminar.
   ============================================================ */

let _invProductos  = [];
let _invCategorias = [];
let _invUnidades   = [];
let _invEditando   = null;

const UNIDAD_POR_DEFECTO = '7'; // Unidades (Und)

async function iniciarFrame3() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame3', 'leer')) return;

    if (!Sesion.tienePermiso('frame3', 'crear') && !Sesion.tienePermiso('frame3', 'editar')) {
        document.getElementById('cardFormProducto')?.classList.add('d-none');
    }

    document.getElementById('selFiltroCategoria')?.addEventListener('change', renderizarInventarioFrame3);
    document.getElementById('txtBuscarInventario')?.addEventListener('input', renderizarInventarioFrame3);
    document.getElementById('formProducto')?.addEventListener('submit', submitProducto);
    document.getElementById('btnCancelarProducto')?.addEventListener('click', cancelarEdicionProducto);

    llenarSelect('selIvaProducto', CATALOGO_IVA, (cod, o) => `${cod} — ${o.nombre}`);

    await cargarInventario();
}

function llenarSelect(id, opciones, formato) {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = Object.entries(opciones)
        .map(([cod, val]) => `<option value="${cod}">${esc(formato ? formato(cod, val) : val)}</option>`)
        .join('');
}

async function cargarInventario() {
    try {
        const r = await postJSON(API.inventario.listar, { token: Sesion.token() });
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }
        _invProductos  = r.data.productos  || [];
        _invCategorias = r.data.categorias || [];
        _invUnidades   = r.data.unidades   || [];
        llenarFiltroCategorias();
        llenarSelectsProducto();
        renderizarInventarioFrame3();
    } catch { mostrarAlerta('Error al cargar el inventario.', 'error'); }
}

/* ── Selects: filtro y formulario ────────────────────────────── */
function llenarFiltroCategorias() {
    const sel = document.getElementById('selFiltroCategoria');
    if (!sel) return;
    const previo = sel.value;
    sel.innerHTML = '<option value="">Todas las categorías</option>' +
        '<option value="0">— Sin categoría —</option>' +
        _invCategorias.map(c => `<option value="${c.id_categoria}">${esc(c.nombre)}</option>`).join('');
    if (previo && [...sel.options].some(o => o.value === previo)) sel.value = previo;
}

function llenarSelectsProducto() {
    const selCat = document.getElementById('selCategoriaProducto');
    if (selCat) {
        const previo = selCat.value;
        selCat.innerHTML = '<option value="">— Sin categoría —</option>' +
            _invCategorias.map(c => `<option value="${c.id_categoria}">${esc(c.nombre)}</option>`).join('');
        if (previo && [...selCat.options].some(o => o.value === previo)) selCat.value = previo;
    }
    const selUni = document.getElementById('selUnidadProducto');
    if (selUni) {
        const previo = selUni.value;
        selUni.innerHTML = _invUnidades
            .map(u => `<option value="${u.id_unidad}">${esc(u.nombre)} (${esc(u.abreviatura)})</option>`)
            .join('');
        selUni.value = previo && [...selUni.options].some(o => o.value === previo) ? previo : UNIDAD_POR_DEFECTO;
    }
}

/* ── Tabla del inventario ────────────────────────────────────── */
function renderizarInventarioFrame3() {
    const tbody = document.getElementById('tbodyInventario');
    if (!tbody) return;

    const filtroCat = document.getElementById('selFiltroCategoria')?.value ?? '';
    const busqueda  = (document.getElementById('txtBuscarInventario')?.value || '').toLowerCase().trim();

    const lista = _invProductos.filter(p => {
        if (filtroCat === '0' && p.id_categoria) return false;
        if (filtroCat !== '' && filtroCat !== '0' && p.id_categoria != filtroCat) return false;
        if (busqueda && !(`${p.codigo_principal} ${p.descripcion} ${p.categoria || ''}`.toLowerCase().includes(busqueda))) return false;
        return true;
    });

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="tabla-vacia">No hay productos que coincidan con el filtro.</td></tr>`;
        return;
    }

    const puedeEditar   = Sesion.tienePermiso('frame3', 'editar');
    const puedeEstado   = Sesion.tienePermiso('frame3', 'estado');
    const puedeEliminar = Sesion.tienePermiso('frame3', 'eliminar');

    tbody.innerHTML = lista.map((p, i) => `
        <tr>
            <td class="col-num">${i + 1}</td>
            <td>${esc(p.codigo_principal)}</td>
            <td><strong>${esc(p.descripcion)}</strong></td>
            <td>${esc(p.categoria || '—')}</td>
            <td>${esc(p.unidad)} (${esc(p.unidad_abrev)})</td>
            <td class="${Number(p.stock) <= 0 ? 'text-danger' : ''}"><strong>${Number(p.stock).toFixed(2)}</strong> ${esc(p.unidad_abrev)}</td>
            <td>$${Number(p.precio_unitario).toFixed(2)}</td>
            <td>${esc(p.codigo_porcentaje_iva)} — ${esc((CATALOGO_IVA[p.codigo_porcentaje_iva] || {}).nombre || '')}</td>
            <td><span class="badge ${p.estado == 1 ? 'badge-activo' : 'badge-inactivo'}">${p.estado == 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <div class="btn-group">
                    ${puedeEditar ? `<button class="btn btn-sm btn-outline" onclick="editarProducto(${p.id_producto})">Editar</button>` : ''}
                    ${puedeEstado ? `<button class="btn btn-sm ${p.estado == 1 ? 'btn-warning' : 'btn-success'}" onclick="toggleEstadoProducto(${p.id_producto})">${p.estado == 1 ? 'Desactivar' : 'Activar'}</button>` : ''}
                    ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    renumerarFilas(tbody);
}

/* ── Crear / editar producto ─────────────────────────────────── */
function editarProducto(id) {
    const p = _invProductos.find(x => x.id_producto == id);
    if (!p) return;
    _invEditando = id;
    document.getElementById('txtCodigoProducto').value = p.codigo_principal;
    document.getElementById('txtDescripcionProducto').value = p.descripcion;
    document.getElementById('txtPrecioProducto').value = p.precio_unitario;
    document.getElementById('selIvaProducto').value = p.codigo_porcentaje_iva;
    document.getElementById('selCategoriaProducto').value = p.id_categoria || '';
    document.getElementById('selUnidadProducto').value = p.id_unidad;
    document.getElementById('txtStockProducto').value = Number(p.stock);
    document.getElementById('btnGuardarProducto').textContent = 'Actualizar Producto';
    document.getElementById('btnCancelarProducto')?.classList.remove('d-none');
}

function cancelarEdicionProducto() {
    _invEditando = null;
    document.getElementById('formProducto')?.reset();
    const selUni = document.getElementById('selUnidadProducto');
    if (selUni) selUni.value = UNIDAD_POR_DEFECTO;
    document.getElementById('btnGuardarProducto').textContent = 'Guardar Producto';
    document.getElementById('btnCancelarProducto')?.classList.add('d-none');
}

async function submitProducto(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const codigo      = document.getElementById('txtCodigoProducto');
    const descripcion = document.getElementById('txtDescripcionProducto');
    const precio       = document.getElementById('txtPrecioProducto');
    if (!Validaciones.requerido(codigo, 'Código')) return;
    if (!Validaciones.requerido(descripcion, 'Descripción')) return;
    if (!Validaciones.requerido(precio, 'Precio unitario')) return;

    const accion = _invEditando ? 'editar' : 'crear';
    if (!Sesion.tienePermiso('frame3', accion)) {
        mostrarAlerta(`No tiene permiso para ${accion} productos.`, 'error');
        return;
    }

    const datos = {
        token:                  Sesion.token(),
        codigo_principal:       codigo.value.trim(),
        descripcion:            descripcion.value.trim(),
        precio_unitario:        parseFloat(precio.value),
        codigo_porcentaje_iva:  document.getElementById('selIvaProducto').value,
        id_categoria:           document.getElementById('selCategoriaProducto').value || null,
        id_unidad:              document.getElementById('selUnidadProducto').value,
        stock:                  parseFloat(document.getElementById('txtStockProducto').value) || 0,
    };
    if (_invEditando) datos.id_producto = _invEditando;

    try {
        const r = await postJSON(_invEditando ? API.inventario.editar : API.inventario.crear, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            cancelarEdicionProducto();
            await cargarInventario();
        } else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Estado y eliminación ────────────────────────────────────── */
async function toggleEstadoProducto(id) {
    try {
        const r = await postJSON(API.inventario.estado, { token: Sesion.token(), id_producto: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarInventario(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

function eliminarProducto(id) {
    const p = _invProductos.find(x => x.id_producto == id);
    if (!p) return;
    if (!Sesion.tienePermiso('frame3', 'eliminar')) {
        mostrarAlerta('No tiene permiso para eliminar productos.', 'error');
        return;
    }
    confirmarEliminacionCritica({
        tipo:        'Producto',
        nombre:      p.codigo_principal,
        advertencia: 'Las facturas ya emitidas conservarán su detalle histórico.',
        accion:      async () => {
            try {
                const r = await postJSON(API.inventario.eliminar, { token: Sesion.token(), id_producto: id });
                mostrarAlerta(r.msg, r.ok ? 'ok' : 'error');
                if (r.ok) {
                    if (_invEditando == id) cancelarEdicionProducto();
                    await cargarInventario();
                }
            } catch { mostrarAlerta('Error de conexión.', 'error'); }
        },
    });
}
