/* ============================================================
   MENU-PERSONAL.JS — Módulo "Menú": organización personal
   SuperMenus propios + Drag & Drop de ItemMenus. El orden se
   guarda automáticamente y solo afecta al usuario autenticado.
   ============================================================ */

let _supers = [];            // [{id_super, nombre, orden}]
let _zonas  = { root: [] };  // 'root' | 's<id_super>' → [items]

async function iniciarMenuPersonal() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('menu', 'leer')) return;

    document.getElementById('btnNuevoSuper')?.addEventListener('click', crearSuper);
    await cargarMiMenu();
}

async function cargarMiMenu() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.miMenu, { token: Sesion.token() });
        mostrarCargando(false);
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        _supers = r.data.supers || [];
        _zonas  = { root: [] };
        _supers.forEach(s => { _zonas['s' + s.id_super] = []; });
        (r.data.items || []).forEach(it => {
            const zona = it.id_super && _zonas['s' + it.id_super] ? 's' + it.id_super : 'root';
            _zonas[zona].push(it);
        });
        renderOrganizador();
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar el menú.', 'error');
    }
}

function renderOrganizador() {
    const cont = document.getElementById('organizadorMenu');
    if (!cont) return;

    const renderItems = zona => _zonas[zona].map(it => `
        <li class="om-item" draggable="true" data-item="${it.id_menu}">
            <span class="om-arrastre">⠿</span>
            <span class="nav-icono">${resolverIcono(it.icono)}</span>
            <span>${esc(it.nombre)}</span>
        </li>`).join('') || '<li class="om-vacio">Arrastre elementos aquí</li>';

    cont.innerHTML = `
        <div class="card mb-2">
            <div class="card-header"><span class="card-titulo">Elementos sin agrupar</span></div>
            <ul class="om-zona" data-zona="root">${renderItems('root')}</ul>
        </div>
        ${_supers.map(s => `
        <div class="card mb-2 om-super" data-super="${s.id_super}">
            <div class="card-header om-super-header" draggable="true" data-superdrag="${s.id_super}">
                <span class="card-titulo"><span class="om-arrastre">⠿</span> ${esc(s.nombre)}</span>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline" data-renombrar="${s.id_super}">✎ Renombrar</button>
                    ${_zonas['s' + s.id_super].length === 0
                        ? `<button class="btn btn-sm btn-danger" data-eliminar="${s.id_super}">Eliminar</button>`
                        : ''}
                </div>
            </div>
            <ul class="om-zona" data-zona="s${s.id_super}">${renderItems('s' + s.id_super)}</ul>
        </div>`).join('')}`;

    _activarDragDrop(cont);
}

function _activarDragDrop(cont) {
    /* Arrastrar ItemMenus */
    cont.querySelectorAll('.om-item').forEach(li => {
        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'item:' + li.dataset.item);
            li.classList.add('om-arrastrando');
        });
        li.addEventListener('dragend', () => li.classList.remove('om-arrastrando'));
    });

    /* Soltar ItemMenus en cualquier zona (reordenar o mover entre SuperMenus) */
    cont.querySelectorAll('.om-zona').forEach(ul => {
        ul.addEventListener('dragover', e => {
            e.preventDefault();
            ul.classList.add('om-zona-hover');
        });
        ul.addEventListener('dragleave', () => ul.classList.remove('om-zona-hover'));
        ul.addEventListener('drop', e => {
            ul.classList.remove('om-zona-hover');
            const dato = e.dataTransfer.getData('text/plain');
            if (!dato.startsWith('item:')) return;
            e.preventDefault();
            e.stopPropagation();
            _soltarItem(parseInt(dato.slice(5)), ul.dataset.zona, e.target.closest('.om-item'));
        });
    });

    /* Reordenar SuperMenus arrastrando su cabecera sobre otro bloque */
    cont.querySelectorAll('.om-super-header').forEach(h => {
        h.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'super:' + h.dataset.superdrag);
            e.stopPropagation();
        });
    });
    cont.querySelectorAll('.om-super').forEach(bloque => {
        bloque.addEventListener('dragover', e => e.preventDefault());
        bloque.addEventListener('drop', e => {
            const dato = e.dataTransfer.getData('text/plain');
            if (!dato.startsWith('super:')) return;
            e.preventDefault();
            e.stopPropagation();
            _soltarSuper(parseInt(dato.slice(6)), parseInt(bloque.dataset.super));
        });
    });

    cont.querySelectorAll('[data-renombrar]').forEach(b =>
        b.addEventListener('click', () => renombrarSuper(parseInt(b.dataset.renombrar))));
    cont.querySelectorAll('[data-eliminar]').forEach(b =>
        b.addEventListener('click', () => eliminarSuper(parseInt(b.dataset.eliminar))));
}

function _soltarItem(id, zonaDestino, liRef) {
    let origen = null, idx = -1;
    for (const z in _zonas) {
        const i = _zonas[z].findIndex(x => x.id_menu == id);
        if (i >= 0) { origen = z; idx = i; break; }
    }
    if (!origen || !_zonas[zonaDestino]) return;

    const [item]  = _zonas[origen].splice(idx, 1);
    const destino = _zonas[zonaDestino];
    let pos = destino.length;
    if (liRef && liRef.dataset.item != id) {
        const i = destino.findIndex(x => x.id_menu == liRef.dataset.item);
        if (i >= 0) pos = i;
    }
    destino.splice(pos, 0, item);

    renderOrganizador();
    guardarOrganizacion();
}

function _soltarSuper(idMovido, idDestino) {
    if (idMovido === idDestino) return;
    const desde = _supers.findIndex(s => s.id_super === idMovido);
    if (desde < 0) return;
    const [s] = _supers.splice(desde, 1);
    const hasta = _supers.findIndex(x => x.id_super === idDestino);
    _supers.splice(hasta < 0 ? _supers.length : hasta, 0, s);

    renderOrganizador();
    guardarOrganizacion();
}

/* Guardado automático de la organización del usuario */
async function guardarOrganizacion() {
    const supers = _supers.map((s, i) => ({ id_super: s.id_super, orden: 101 + i }));
    const items  = [];
    Object.keys(_zonas).forEach(z => {
        _zonas[z].forEach((it, i) => {
            items.push({
                id_menu:  it.id_menu,
                id_super: z === 'root' ? null : parseInt(z.slice(1)),
                orden:    i + 1,
            });
        });
    });
    try {
        const r = await postJSON(API.menu.organizar, { token: Sesion.token(), supers, items });
        if (!r.ok) mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al guardar el menú.', 'error'); }
}

async function crearSuper() {
    const nombre = (window.prompt('Nombre del nuevo SuperMenu:') || '').trim();
    if (!nombre) return;
    try {
        const r = await postJSON(API.menu.superCrear, { token: Sesion.token(), nombre });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarMiMenu(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

async function renombrarSuper(id) {
    const actual = _supers.find(s => s.id_super === id);
    const nombre = (window.prompt('Nuevo nombre del SuperMenu:', actual?.nombre || '') || '').trim();
    if (!nombre || nombre === actual?.nombre) return;
    try {
        const r = await postJSON(API.menu.superRenombrar, { token: Sesion.token(), id_super: id, nombre });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarMiMenu(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}

async function eliminarSuper(id) {
    if (!confirmar('¿Eliminar este SuperMenu vacío?')) return;
    try {
        const r = await postJSON(API.menu.superEliminar, { token: Sesion.token(), id_super: id });
        if (r.ok) { mostrarAlerta(r.msg, 'ok'); await cargarMiMenu(); }
        else mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error de conexión.', 'error'); }
}
