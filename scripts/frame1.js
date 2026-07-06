/* ============================================================
   FRAME1.JS — CRUD de tareas con permisos RBAC por operación
   ============================================================ */

let _tareas     = [];
let _editandoId = null;

async function iniciarFrame1() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('frame1', 'leer')) return;

    if (!Sesion.tienePermiso('frame1', 'crear') && !Sesion.tienePermiso('frame1', 'editar')) {
        document.getElementById('cardFormTarea')?.classList.add('d-none');
    }

    await cargarTareas();

    document.getElementById('formTarea')?.addEventListener('submit', submitTarea);
    document.getElementById('btnCancelarEdicion')?.addEventListener('click', cancelarEdicion);
}

async function cargarTareas() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.tareas.listar, { token: Sesion.token() });
        mostrarCargando(false);
        if (r.ok) renderizarTablaTareas(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar tareas.', 'error');
    }
}

function renderizarTablaTareas(lista) {
    const tbody = document.getElementById('tbodyTareas');
    if (!tbody) return;

    _tareas = lista || [];

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="tabla-vacia">No hay tareas registradas.</td></tr>`;
        return;
    }

    const puedeEditar   = Sesion.tienePermiso('frame1', 'editar');
    const puedeEliminar = Sesion.tienePermiso('frame1', 'eliminar');

    tbody.innerHTML = lista.map(t => `
        <tr>
            <td>${esc(t.id_tarea)}</td>
            <td><strong>${esc(t.titulo)}</strong></td>
            <td>${esc(t.descripcion || '—')}</td>
            <td>${esc(t.creador || '—')}</td>
            <td>
                <div class="btn-group">
                    ${puedeEditar ? `<button class="btn btn-sm btn-outline" onclick="editarTarea(${t.id_tarea})">Editar</button>` : ''}
                    ${puedeEliminar ? `<button class="btn btn-sm btn-danger" onclick="eliminarTarea(${t.id_tarea})">Eliminar</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function editarTarea(id) {
    const t = _tareas.find(x => x.id_tarea == id);
    if (!t) return;
    _editandoId = id;
    document.getElementById('txtTitulo').value      = t.titulo;
    document.getElementById('txtDescripcion').value = t.descripcion || '';
    document.getElementById('btnGuardarTarea').textContent = 'Actualizar Tarea';
    document.getElementById('btnCancelarEdicion')?.classList.remove('d-none');
    document.getElementById('cardFormTarea')?.classList.remove('d-none');
}

function cancelarEdicion() {
    _editandoId = null;
    document.getElementById('formTarea')?.reset();
    document.getElementById('btnGuardarTarea').textContent = 'Guardar Tarea';
    document.getElementById('btnCancelarEdicion')?.classList.add('d-none');
    if (!Sesion.tienePermiso('frame1', 'crear') && !Sesion.tienePermiso('frame1', 'editar')) {
        document.getElementById('cardFormTarea')?.classList.add('d-none');
    }
}

async function submitTarea(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const titulo = document.getElementById('txtTitulo');
    if (!Validaciones.requerido(titulo, 'Título')) return;

    const accion = _editandoId ? 'editar' : 'crear';
    if (!Sesion.tienePermiso('frame1', accion)) {
        mostrarAlerta(`No tiene permiso para ${accion} tareas.`, 'error');
        return;
    }

    const datos = {
        token:       Sesion.token(),
        titulo:      titulo.value.trim(),
        descripcion: document.getElementById('txtDescripcion').value.trim(),
    };
    if (_editandoId) datos.id_tarea = _editandoId;

    try {
        const r = await postJSON(_editandoId ? API.tareas.editar : API.tareas.crear, datos);
        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            cancelarEdicion();
            await cargarTareas();
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

async function eliminarTarea(id) {
    if (!confirmar('¿Eliminar esta tarea?')) return;
    try {
        const r = await postJSON(API.tareas.eliminar, { token: Sesion.token(), id_tarea: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarTareas(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
