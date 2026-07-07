/* ============================================================
   MENU-CONFIG.JS — Módulo "Configurar Menús" (solo Administrador)
   Disponibilidad global de los ItemMenu, y administración de su
   nombre y URL. Los cambios de disponibilidad se acumulan y se
   persisten con el botón "Guardar"; crear/editar un ItemMenu se
   persiste de inmediato.
   ============================================================ */

let _configItems = [];   // {id_menu, nombre, icono, url, modulo, estado, nuevo}
let _idEditando  = null; // id_menu en edición, o null si se está creando

async function iniciarConfigMenus() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('configmenu', 'leer')) return;

    // Cada botón consulta únicamente su propio permiso, independiente del resto
    if (!Sesion.tienePermiso('configmenu', 'crear')) {
        document.getElementById('btnNuevoItemMenu')?.classList.add('d-none');
    }
    if (!Sesion.tienePermiso('configmenu', 'estado')) {
        document.getElementById('btnGuardarConfig')?.classList.add('d-none');
    }

    document.getElementById('btnGuardarConfig')?.addEventListener('click', guardarConfigMenus);
    document.getElementById('btnNuevoItemMenu')?.addEventListener('click', nuevoItemMenu);
    document.getElementById('formItemMenu')?.addEventListener('submit', submitItemMenu);
    document.getElementById('btnCerrarModalItem')?.addEventListener('click', cerrarModalItem);
    document.getElementById('btnCancelarModalItem')?.addEventListener('click', cerrarModalItem);
    document.getElementById('modalItemMenu')?.addEventListener('click', e => {
        if (e.target === e.currentTarget) cerrarModalItem();
    });

    await cargarConfigMenus();
}

async function cargarConfigMenus() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.configListar, { token: Sesion.token() });
        mostrarCargando(false);
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }
        _configItems = (r.data || []).map(m => ({ ...m, nuevo: m.estado == 1 }));
        renderizarConfigMenus();
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar los ItemMenu.', 'error');
    }
}

function renderizarConfigMenus() {
    const tbody = document.getElementById('tbodyConfigMenu');
    if (!tbody) return;

    if (_configItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="tabla-vacia">No hay ItemMenu registrados.</td></tr>`;
        return;
    }

    // Cada control consulta únicamente su propio permiso, de forma independiente
    const puedeEditar  = Sesion.tienePermiso('configmenu', 'editar');
    const puedeEliminar = Sesion.tienePermiso('configmenu', 'eliminar');
    const puedeEstado  = Sesion.tienePermiso('configmenu', 'estado');

    tbody.innerHTML = _configItems.map((m, i) => `
        <tr>
            <td class="col-num">${i + 1}</td>
            <td>${esc(m.id_menu)}</td>
            <td>${resolverIcono(m.icono)} <strong>${esc(m.nombre)}</strong></td>
            <td><code>${esc(m.url)}</code></td>
            <td>
                <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
                    <input type="checkbox" data-id="${m.id_menu}"
                        style="width:18px;height:18px;accent-color:var(--primary)"
                        ${m.nuevo ? 'checked' : ''}
                        ${(m.modulo === 'configmenu' || !puedeEstado) ? 'disabled' : ''}
                        ${m.modulo === 'configmenu' ? 'title="Este módulo no puede desactivarse"' : ''}>
                    <span>Activo</span>
                </label>
            </td>
            <td>
                <div class="btn-group">
                    ${puedeEditar ? `<button class="btn btn-sm btn-outline" onclick="editarItemMenu(${m.id_menu})">Editar</button>` : ''}
                    ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminarItemMenu(${m.id_menu})">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('input[data-id]').forEach(ch => {
        ch.addEventListener('change', () => {
            const item = _configItems.find(m => m.id_menu == ch.dataset.id);
            if (item) item.nuevo = ch.checked;
        });
    });
}

/* Persiste todos los cambios de disponibilidad, refresca la tabla y el sidebar del shell */
async function guardarConfigMenus() {
    const cambios = _configItems.filter(m => m.nuevo !== (m.estado == 1));
    if (cambios.length === 0) {
        mostrarAlerta('No hay cambios por guardar.', 'warning');
        return;
    }

    let errores = 0;
    for (const m of cambios) {
        try {
            const r = await postJSON(API.menu.configEstado, {
                token:   Sesion.token(),
                id_menu: m.id_menu,
                estado:  m.nuevo ? 1 : 0,
            });
            if (!r.ok) { errores++; mostrarAlerta(r.msg, 'error'); }
        } catch { errores++; }
    }

    await cargarConfigMenus();
    await _refrescarShell();

    if (errores === 0) {
        mostrarAlerta(`Cambios guardados (${cambios.length} ItemMenu actualizados).`, 'ok');
    }
}

/* ── Crear / editar ItemMenu (únicamente nombre y URL) ───────── */
function nuevoItemMenu() {
    _idEditando = null;
    document.getElementById('tituloModalItem').textContent = 'Nuevo ItemMenu';
    document.getElementById('formItemMenu')?.reset();
    Validaciones.limpiar(document.getElementById('formItemMenu'));
    abrirModalItem();
}

function editarItemMenu(id) {
    const item = _configItems.find(m => m.id_menu == id);
    if (!item) return;
    _idEditando = id;
    document.getElementById('tituloModalItem').textContent = 'Editar ItemMenu';
    document.getElementById('txtNombreItem').value = item.nombre;
    document.getElementById('txtUrlItem').value    = item.url;
    Validaciones.limpiar(document.getElementById('formItemMenu'));
    abrirModalItem();
}

function abrirModalItem() {
    document.getElementById('modalItemMenu')?.classList.add('visible');
}

function cerrarModalItem() {
    document.getElementById('modalItemMenu')?.classList.remove('visible');
}

async function submitItemMenu(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const nombre = document.getElementById('txtNombreItem');
    const url    = document.getElementById('txtUrlItem');

    let valido = true;
    if (!Validaciones.requerido(nombre, 'Nombre')) valido = false;
    if (!Validaciones.requerido(url, 'URL'))       valido = false;
    else if (!Validaciones.ruta(url))              valido = false;

    if (valido) {
        const urlLimpia = url.value.trim();
        const duplicada = _configItems.some(m => m.url === urlLimpia && m.id_menu !== _idEditando);
        if (duplicada) {
            Validaciones.mostrar(url, 'Ya existe un ItemMenu con esa URL.');
            valido = false;
        }
    }
    if (!valido) return;

    const datos = {
        token:  Sesion.token(),
        nombre: nombre.value.trim(),
        url:    url.value.trim(),
    };

    const esEdicion = _idEditando !== null;
    if (esEdicion) datos.id_menu = _idEditando;

    try {
        const r = await postJSON(esEdicion ? API.menu.configEditar : API.menu.configCrear, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            cerrarModalItem();
            await cargarConfigMenus();
            await _refrescarShell();
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

/* ── Eliminar ItemMenu: el Administrador tiene control total, cualquier
   ItemMenu puede eliminarse (incluidos los del propio sistema) ───────── */
function eliminarItemMenu(id) {
    const item = _configItems.find(m => m.id_menu == id);
    if (!item) return;

    confirmarEliminacionCritica({
        tipo:        'ItemMenu',
        nombre:      item.nombre,
        advertencia: 'Se eliminarán también sus permisos asociados y desaparecerá del menú de todos los usuarios.',
        accion: async () => {
            try {
                const r = await postJSON(API.menu.configEliminar, { token: Sesion.token(), id_menu: id });
                if (r.ok) {
                    mostrarAlerta(r.msg, 'ok');
                    await cargarConfigMenus();
                    await _refrescarShell();
                } else {
                    mostrarAlerta(r.msg, 'error');
                }
            } catch { mostrarAlerta('Error de conexión.', 'error'); }
        },
    });
}

/* Refleja los cambios en el sidebar del shell de inmediato, sin cerrar sesión */
async function _refrescarShell() {
    try {
        const p = window.parent;
        if (p !== window && typeof p.cargarMenuYRenderizar === 'function') {
            await p.cargarMenuYRenderizar(document.title.split('—')[0].trim());
            p.Shell?.marcarActivo?.(window.location.pathname);
        }
    } catch { /* fuera del shell no hay sidebar que refrescar */ }
}
