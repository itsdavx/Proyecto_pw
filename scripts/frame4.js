/* ============================================================
   FRAME4.JS — Clientes: módulo único responsable de la
   administración de clientes — listado con búsqueda, creación,
   edición, activación y eliminación con confirmación reforzada.
   Facturación consume este mismo listado como fuente única
   (servidor/clientes/listar.php).
   Permisos: frame4 leer / crear / editar / estado / eliminar.
   ============================================================ */

const TIPO_ID_CLIENTE = {
    '04': 'RUC',
    '05': 'CÉDULA',
    '06': 'PASAPORTE',
    '07': 'CONSUMIDOR FINAL',
    '08': 'IDENTIFICACIÓN DEL EXTERIOR',
};

let _cliProductosLista = []; // listado completo de clientes
let _cliEditando       = null;
let _pagClientes       = null;

async function iniciarFrame4() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame4', 'leer')) return;

    if (!Sesion.tienePermiso('frame4', 'crear') && !Sesion.tienePermiso('frame4', 'editar')) {
        document.getElementById('cardFormCliente')?.classList.add('d-none');
    }

    const sel = document.getElementById('selTipoIdCliente');
    if (sel) {
        sel.innerHTML = Object.entries(TIPO_ID_CLIENTE)
            .map(([cod, nombre]) => `<option value="${cod}">${cod} — ${esc(nombre)}</option>`)
            .join('');
    }

    document.getElementById('txtBuscarCliente')?.addEventListener('input', () => renderizarTablaClientes(true));
    document.getElementById('formCliente')?.addEventListener('submit', submitCliente);
    document.getElementById('btnCancelarCliente')?.addEventListener('click', cancelarEdicionCliente);

    _pagClientes = crearPaginador({ clave: 'clientes', tbodyId: 'tbodyClientes', etiqueta: 'clientes', pintar: _pintarFilasClientes });
    await cargarClientesFrame4();
}

async function cargarClientesFrame4() {
    try {
        const r = await postJSON(API.clientes.listar, { token: Sesion.token() });
        if (r.ok) { _cliProductosLista = r.data; renderizarTablaClientes(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar clientes.', 'error'); }
}

function renderizarTablaClientes(reiniciar = false) {
    const busqueda = (document.getElementById('txtBuscarCliente')?.value || '').toLowerCase().trim();
    const lista = busqueda
        ? _cliProductosLista.filter(c =>
            `${c.identificacion} ${c.razon_social} ${c.email || ''} ${c.telefono || ''}`.toLowerCase().includes(busqueda))
        : _cliProductosLista;
    _pagClientes.render(lista, { reiniciar });
}

function _pintarFilasClientes(lista, offset) {
    const tbody = document.getElementById('tbodyClientes');
    if (!tbody) return;

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="tabla-vacia">No hay clientes que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    const puedeEditar   = Sesion.tienePermiso('frame4', 'editar');
    const puedeEstado   = Sesion.tienePermiso('frame4', 'estado');
    const puedeEliminar = Sesion.tienePermiso('frame4', 'eliminar');

    tbody.innerHTML = lista.map((c, i) => `
        <tr>
            <td class="col-num">${offset + i + 1}</td>
            <td>${esc(c.tipo_identificacion)} — ${esc(TIPO_ID_CLIENTE[c.tipo_identificacion] || '')}</td>
            <td>${esc(c.identificacion)}</td>
            <td><strong>${esc(c.razon_social)}</strong></td>
            <td>${esc(c.direccion || '—')}</td>
            <td>${esc(c.email || '—')}<br><span class="text-muted">${esc(c.telefono || '')}</span></td>
            <td><span class="badge ${c.estado == 1 ? 'badge-activo' : 'badge-inactivo'}">${c.estado == 1 ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <div class="btn-group">
                    ${puedeEditar ? `<button class="btn btn-sm btn-outline" onclick="editarCliente(${c.id_cliente})">Editar</button>` : ''}
                    ${puedeEstado ? `<button class="btn btn-sm ${c.estado == 1 ? 'btn-warning' : 'btn-success'}" onclick="toggleEstadoCliente(${c.id_cliente})">${c.estado == 1 ? 'Desactivar' : 'Activar'}</button>` : ''}
                    ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminarCliente(${c.id_cliente})">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/* ── Crear / editar cliente ──────────────────────────────────── */
function editarCliente(id) {
    const c = _cliProductosLista.find(x => x.id_cliente == id);
    if (!c) return;
    _cliEditando = id;
    document.getElementById('selTipoIdCliente').value = c.tipo_identificacion;
    document.getElementById('txtIdentificacionCliente').value = c.identificacion;
    document.getElementById('txtRazonSocialCliente').value = c.razon_social;
    document.getElementById('txtDireccionCliente').value = c.direccion || '';
    document.getElementById('txtEmailCliente').value = c.email || '';
    document.getElementById('txtTelefonoCliente').value = c.telefono || '';
    document.getElementById('btnGuardarCliente').textContent = 'Actualizar Cliente';
    document.getElementById('btnCancelarCliente')?.classList.remove('d-none');
}

function cancelarEdicionCliente() {
    _cliEditando = null;
    document.getElementById('formCliente')?.reset();
    document.getElementById('btnGuardarCliente').textContent = 'Guardar Cliente';
    document.getElementById('btnCancelarCliente')?.classList.add('d-none');
}

async function submitCliente(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const identificacion = document.getElementById('txtIdentificacionCliente');
    const razonSocial    = document.getElementById('txtRazonSocialCliente');
    if (!Validaciones.requerido(identificacion, 'Identificación')) return;
    if (!Validaciones.requerido(razonSocial, 'Razón social')) return;

    const accion = _cliEditando ? 'editar' : 'crear';
    if (!Sesion.tienePermiso('frame4', accion)) {
        mostrarAlerta(`No tiene permiso para ${accion} clientes.`, 'error');
        return;
    }

    const datos = {
        token:               Sesion.token(),
        tipo_identificacion: document.getElementById('selTipoIdCliente').value,
        identificacion:      identificacion.value.trim(),
        razon_social:        razonSocial.value.trim(),
        direccion:           document.getElementById('txtDireccionCliente').value.trim(),
        email:               document.getElementById('txtEmailCliente').value.trim(),
        telefono:            document.getElementById('txtTelefonoCliente').value.trim(),
    };
    if (_cliEditando) datos.id_cliente = _cliEditando;

    try {
        const r = await postJSON(_cliEditando ? API.clientes.editar : API.clientes.crear, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            cancelarEdicionCliente();
            await cargarClientesFrame4();
        } else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Estado y eliminación ────────────────────────────────────── */
async function toggleEstadoCliente(id) {
    try {
        const r = await postJSON(API.clientes.estado, { token: Sesion.token(), id_cliente: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarClientesFrame4(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

function eliminarCliente(id) {
    const c = _cliProductosLista.find(x => x.id_cliente == id);
    if (!c) return;
    if (!Sesion.tienePermiso('frame4', 'eliminar')) {
        mostrarAlerta('No tiene permiso para eliminar clientes.', 'error');
        return;
    }
    confirmarEliminacionCritica({
        tipo:        'Cliente',
        nombre:      c.razon_social,
        advertencia: 'Un cliente con facturas emitidas no puede eliminarse (el servidor lo verificará).',
        accion:      async () => {
            try {
                const r = await postJSON(API.clientes.eliminar, { token: Sesion.token(), id_cliente: id });
                mostrarAlerta(r.msg, r.ok ? 'ok' : 'error');
                if (r.ok) {
                    if (_cliEditando == id) cancelarEdicionCliente();
                    await cargarClientesFrame4();
                }
            } catch { mostrarAlerta('Error de conexión.', 'error'); }
        },
    });
}
