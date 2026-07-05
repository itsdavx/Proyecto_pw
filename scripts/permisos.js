/* ============================================================
   PERMISOS.JS — Matriz de permisos por rol
   ============================================================ */

const MODULOS_SISTEMA = [
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'roles',    label: 'Roles' },
    { key: 'permisos', label: 'Permisos' },
    { key: 'menu',     label: 'Menú' },
    { key: 'opciones', label: 'Opciones' },
    { key: 'perfil',   label: 'Mi Perfil' },
    { key: 'dashboard',label: 'Dashboard' },
];
const ACCIONES = ['leer', 'crear', 'editar', 'eliminar'];

let _rolesData    = [];
let _permisosData = [];
let _rolSelec     = null;

async function iniciarPermisos() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('permisos', 'leer')) return;

    cargarMenuYRenderizar('Permisos');
    await cargarRolesSelect();

    document.getElementById('selRolPermisos')?.addEventListener('change', onCambiarRol);
    document.getElementById('btnGuardarPermisos')?.addEventListener('click', guardarPermisos);
    document.getElementById('btnMarcarTodos')?.addEventListener('click', () => marcarTodos(true));
    document.getElementById('btnDesmarcarTodos')?.addEventListener('click', () => marcarTodos(false));
}

async function cargarRolesSelect() {
    try {
        const r = await postJSON(API.roles.listar, { token: Sesion.token() });
        if (!r.ok) return;
        _rolesData = r.data;
        const sel = document.getElementById('selRolPermisos');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Seleccione un rol --</option>' +
            r.data.map(rol => `<option value="${rol.id_rol}">${esc(rol.nombre_rol)}</option>`).join('');
    } catch { mostrarAlerta('Error al cargar roles.', 'error'); }
}

async function onCambiarRol() {
    const sel = document.getElementById('selRolPermisos');
    _rolSelec  = sel.value;
    if (!_rolSelec) { limpiarMatriz(); return; }

    mostrarCargando(true);
    try {
        const r = await postJSON(API.permisos.listar, { token: Sesion.token(), id_rol: _rolSelec });
        mostrarCargando(false);
        if (r.ok) {
            _permisosData = r.data;
            renderizarMatriz(_permisosData);
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar permisos.', 'error');
    }
}

function renderizarMatriz(permisos) {
    const contenedor = document.getElementById('matrizPermisos');
    if (!contenedor) return;

    const esSuperAdmin = _rolSelec == 1;

    let html = `<div class="permisos-grid">
        <div class="p-header">Módulo</div>
        ${ACCIONES.map(a => `<div class="p-header">${a.charAt(0).toUpperCase() + a.slice(1)}</div>`).join('')}`;

    MODULOS_SISTEMA.forEach(mod => {
        html += `<div class="p-modulo">${esc(mod.label)}</div>`;
        ACCIONES.forEach(accion => {
            const marcado = esSuperAdmin || permisos.some(p => p.modulo === mod.key && p.accion === accion);
            html += `<div class="p-check">
                <input type="checkbox"
                    id="perm_${mod.key}_${accion}"
                    data-modulo="${mod.key}"
                    data-accion="${accion}"
                    ${marcado ? 'checked' : ''}
                    ${esSuperAdmin ? 'disabled' : ''}>
            </div>`;
        });
    });

    html += '</div>';
    if (esSuperAdmin) {
        html += `<p class="text-muted mt-2" style="font-size:.85rem">
            El Super-Admin tiene todos los permisos y no pueden modificarse.</p>`;
    }
    contenedor.innerHTML = html;
    document.getElementById('accionesPermisos')?.classList.remove('d-none');
}

function limpiarMatriz() {
    const contenedor = document.getElementById('matrizPermisos');
    if (contenedor) contenedor.innerHTML = '';
    document.getElementById('accionesPermisos')?.classList.add('d-none');
}

function marcarTodos(valor) {
    document.querySelectorAll('#matrizPermisos input[type="checkbox"]:not(:disabled)').forEach(ch => {
        ch.checked = valor;
    });
}

async function guardarPermisos() {
    if (!_rolSelec) { mostrarAlerta('Seleccione un rol.', 'warning'); return; }

    const permisos = [];
    document.querySelectorAll('#matrizPermisos input[type="checkbox"]:checked').forEach(ch => {
        permisos.push({ modulo: ch.dataset.modulo, accion: ch.dataset.accion });
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
