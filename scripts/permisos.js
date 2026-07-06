/* ============================================================
   PERMISOS.JS — Permisos por rol en dos niveles:
   1) Acceso a Frames (Habilitar = acción 'leer')
   2) Acciones internas de cada Frame habilitado
   El registro de Frames y acciones proviene del servidor
   (servidor/permisos/registro.php), por lo que agregar un Frame
   nuevo no requiere modificar esta lógica.
   ============================================================ */

let _framesRegistro = [];
let _rolSelec       = null;

async function iniciarPermisos() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('permisos', 'leer')) return;

    await cargarFramesRegistro();
    await cargarRolesSelect();

    document.getElementById('selRolPermisos')?.addEventListener('change', onCambiarRol);
    document.getElementById('btnGuardarPermisos')?.addEventListener('click', guardarPermisos);
    document.getElementById('btnMarcarTodos')?.addEventListener('click', () => marcarTodos(true));
    document.getElementById('btnDesmarcarTodos')?.addEventListener('click', () => marcarTodos(false));
}

async function cargarFramesRegistro() {
    try {
        const r = await postJSON(API.permisos.frames, { token: Sesion.token() });
        if (r.ok) _framesRegistro = r.data;
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al cargar el registro de frames.', 'error'); }
}

async function cargarRolesSelect() {
    try {
        const r = await postJSON(API.roles.listar, { token: Sesion.token() });
        if (!r.ok) return;
        const sel = document.getElementById('selRolPermisos');
        if (!sel) return;
        /* El Administrador siempre posee todos los permisos: no se configura */
        sel.innerHTML = '<option value="">-- Seleccione un rol --</option>' +
            r.data.filter(rol => rol.id_rol != 1)
                  .map(rol => `<option value="${rol.id_rol}">${esc(rol.nombre_rol)}</option>`).join('');
    } catch { mostrarAlerta('Error al cargar roles.', 'error'); }
}

async function onCambiarRol() {
    _rolSelec = document.getElementById('selRolPermisos').value;
    if (!_rolSelec) { limpiarMatriz(); return; }

    mostrarCargando(true);
    try {
        const r = await postJSON(API.permisos.listar, { token: Sesion.token(), id_rol: _rolSelec });
        mostrarCargando(false);
        if (r.ok) renderizarMatrices(r.data);
        else mostrarAlerta(r.msg, 'error');
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar permisos.', 'error');
    }
}

function renderizarMatrices(permisos) {
    const tiene = (mod, acc) => permisos.some(p => p.modulo === mod && p.accion === acc);

    /* ── Nivel 1: acceso a Frames ────────────────────────────── */
    const contFrames = document.getElementById('matrizFrames');
    contFrames.innerHTML = `
        <div class="permisos-grid" style="grid-template-columns:1fr 110px">
            <div class="p-header">Frame</div>
            <div class="p-header">Habilitar</div>
            ${_framesRegistro.map(f => `
                <div class="p-modulo">${esc(f.nombre)}</div>
                <div class="p-check">
                    <input type="checkbox" data-frame="${f.modulo}" ${tiene(f.modulo, 'leer') ? 'checked' : ''}>
                </div>`).join('')}
        </div>`;

    /* ── Nivel 2: acciones internas de cada Frame habilitado ─── */
    const contAcciones = document.getElementById('matrizAcciones');
    contAcciones.innerHTML = _framesRegistro
        .filter(f => f.acciones.length > 0)
        .map(f => `
            <div id="acciones_${f.modulo}" class="${tiene(f.modulo, 'leer') ? '' : 'd-none'}"
                style="margin-bottom:1.2rem">
                <div class="permisos-grid" style="grid-template-columns:1fr 110px">
                    <div class="p-header">${esc(f.nombre)}</div>
                    <div class="p-header">Habilitar</div>
                    ${f.acciones.map(a => `
                        <div class="p-modulo">${esc(a.nombre)}</div>
                        <div class="p-check">
                            <input type="checkbox" data-modulo="${f.modulo}" data-accion="${a.accion}"
                                ${tiene(f.modulo, a.accion) ? 'checked' : ''}>
                        </div>`).join('')}
                </div>
            </div>`).join('');

    /* Habilitar/deshabilitar un Frame muestra u oculta sus acciones */
    contFrames.querySelectorAll('input[data-frame]').forEach(ch => {
        ch.addEventListener('change', () => {
            document.getElementById(`acciones_${ch.dataset.frame}`)?.classList.toggle('d-none', !ch.checked);
            actualizarCardAcciones();
        });
    });

    document.getElementById('accionesPermisos')?.classList.remove('d-none');
    actualizarCardAcciones();
}

function actualizarCardAcciones() {
    const hayVisible = document.querySelector('#matrizAcciones > div:not(.d-none)');
    document.getElementById('cardAcciones')?.classList.toggle('d-none', !hayVisible);
}

function limpiarMatriz() {
    const contFrames = document.getElementById('matrizFrames');
    if (contFrames) {
        contFrames.innerHTML = '<p class="text-muted text-center">Seleccione un rol para configurar sus permisos.</p>';
    }
    const contAcciones = document.getElementById('matrizAcciones');
    if (contAcciones) contAcciones.innerHTML = '';
    document.getElementById('accionesPermisos')?.classList.add('d-none');
    document.getElementById('cardAcciones')?.classList.add('d-none');
}

function marcarTodos(valor) {
    document.querySelectorAll('#matrizFrames input[data-frame]').forEach(ch => {
        ch.checked = valor;
        document.getElementById(`acciones_${ch.dataset.frame}`)?.classList.toggle('d-none', !valor);
    });
    document.querySelectorAll('#matrizAcciones input[data-accion]').forEach(ch => {
        ch.checked = valor;
    });
    actualizarCardAcciones();
}

async function guardarPermisos() {
    if (!_rolSelec) { mostrarAlerta('Seleccione un rol.', 'warning'); return; }

    const permisos = [];
    document.querySelectorAll('#matrizFrames input[data-frame]:checked').forEach(ch => {
        const mod = ch.dataset.frame;
        permisos.push({ modulo: mod, accion: 'leer' });
        /* Solo se guardan las acciones internas de Frames habilitados */
        document.querySelectorAll(`#acciones_${mod} input[data-accion]:checked`).forEach(a => {
            permisos.push({ modulo: mod, accion: a.dataset.accion });
        });
    });

    try {
        const r = await postJSON(API.permisos.asignar, {
            token:    Sesion.token(),
            id_rol:   _rolSelec,
            permisos: permisos,
        });
        if (r.ok) mostrarAlerta(r.msg, 'ok');
        else      mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
