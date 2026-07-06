/* ============================================================
   MENU-PERSONAL.JS — Módulo "Menú": organización personal
   Árbol jerárquico libre: la raíz es una secuencia única donde
   ItemMenus y SuperMenus se intercalan y reordenan por igual
   mediante Drag & Drop. Única regla: el Dashboard nunca se
   agrupa (pero sí participa del orden general).
   ============================================================ */

/* Nodos raíz ordenados:
   { tipo:'item',  item:{id_menu,nombre,icono,modulo} }
   { tipo:'super', super:{id_super,nombre}, items:[...] } */
let _raiz = [];

async function iniciarMenuPersonal() {
    const ok = await Router.proteger();
    if (!ok) return;
    if (!Router.verificarPermiso('menu', 'leer')) return;

    document.getElementById('btnNuevoSuper')?.addEventListener('click', crearSuper);
    document.getElementById('btnGuardarMenu')?.addEventListener('click', guardarMenu);
    await cargarMiMenu();
}

async function cargarMiMenu() {
    mostrarCargando(true);
    try {
        const r = await postJSON(API.menu.miMenu, { token: Sesion.token() });
        mostrarCargando(false);
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        const supersNodos = (r.data.supers || []).map(s => ({
            tipo: 'super', orden: Number(s.orden), super: s, items: [],
        }));
        const porSuper = {};
        supersNodos.forEach(n => { porSuper[n.super.id_super] = n; });

        const itemsRaiz = [];
        (r.data.items || []).forEach(it => {
            if (it.id_super && porSuper[it.id_super]) porSuper[it.id_super].items.push(it);
            else itemsRaiz.push({ tipo: 'item', orden: Number(it.orden), item: it });
        });

        _raiz = [...supersNodos, ...itemsRaiz]
            .sort((a, b) => (a.orden - b.orden) || (a.tipo === 'item' ? -1 : 1));

        renderOrganizador();
    } catch {
        mostrarCargando(false);
        mostrarAlerta('Error al cargar el menú.', 'error');
    }
}

function renderOrganizador() {
    const cont = document.getElementById('organizadorMenu');
    if (!cont) return;

    const itemLi = it => `
        <li class="om-item" draggable="true" data-item="${it.id_menu}">
            <span class="om-arrastre">⠿</span>
            <span class="nav-icono">${resolverIcono(it.icono)}</span>
            <span>${esc(it.nombre)}</span>
        </li>`;

    cont.innerHTML = `
        <div class="card">
            <ul class="om-zona om-raiz" id="zonaRaiz">
                ${_raiz.map(n => n.tipo === 'item' ? itemLi(n.item) : `
                <li class="om-super-nodo" data-super="${n.super.id_super}">
                    <div class="om-super-cab" draggable="true" data-superdrag="${n.super.id_super}">
                        <span class="card-titulo"><span class="om-arrastre">⠿</span> ${esc(n.super.nombre)}</span>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline" data-renombrar="${n.super.id_super}">✎ Renombrar</button>
                            ${n.items.length === 0
                                ? `<button class="btn btn-sm btn-danger" data-eliminar="${n.super.id_super}">Eliminar</button>`
                                : ''}
                        </div>
                    </div>
                    <ul class="om-zona om-zona-super" data-zonasuper="${n.super.id_super}">
                        ${n.items.map(itemLi).join('') || '<li class="om-vacio">Arrastre elementos aquí</li>'}
                    </ul>
                </li>`).join('')}
            </ul>
        </div>`;

    _activarDragDrop(cont);
}

function _activarDragDrop(cont) {
    cont.querySelectorAll('.om-item').forEach(li => {
        li.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'item:' + li.dataset.item);
            e.stopPropagation();
            li.classList.add('om-arrastrando');
        });
        li.addEventListener('dragend', () => li.classList.remove('om-arrastrando'));
    });

    cont.querySelectorAll('.om-super-cab').forEach(h => {
        h.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'super:' + h.dataset.superdrag);
            e.stopPropagation();
        });
    });

    /* Zonas internas de SuperMenus: solo aceptan ItemMenus */
    cont.querySelectorAll('.om-zona-super').forEach(ul => {
        ul.addEventListener('dragover', e => {
            e.preventDefault();
            e.stopPropagation();
            ul.classList.add('om-zona-hover');
        });
        ul.addEventListener('dragleave', () => ul.classList.remove('om-zona-hover'));
        ul.addEventListener('drop', e => {
            e.preventDefault();
            e.stopPropagation();
            ul.classList.remove('om-zona-hover');
            const dato = e.dataTransfer.getData('text/plain');
            if (!dato.startsWith('item:')) return;
            _soltarItem(parseInt(dato.slice(5)), { superId: parseInt(ul.dataset.zonasuper) },
                e.target.closest('.om-item'));
        });
    });

    /* Zona raíz: acepta ItemMenus y SuperMenus intercalados */
    const raiz = cont.querySelector('#zonaRaiz');
    raiz.addEventListener('dragover', e => e.preventDefault());
    raiz.addEventListener('drop', e => {
        if (e.target.closest('.om-zona-super')) return; // lo maneja la zona interna
        e.preventDefault();
        const dato = e.dataTransfer.getData('text/plain');
        const ref  = e.target.closest('#zonaRaiz > li');
        if (dato.startsWith('item:'))  _soltarItem(parseInt(dato.slice(5)), { raiz: true }, ref);
        if (dato.startsWith('super:')) _soltarSuper(parseInt(dato.slice(6)), ref);
    });

    cont.querySelectorAll('[data-renombrar]').forEach(b =>
        b.addEventListener('click', () => renombrarSuper(parseInt(b.dataset.renombrar))));
    cont.querySelectorAll('[data-eliminar]').forEach(b =>
        b.addEventListener('click', () => eliminarSuper(parseInt(b.dataset.eliminar))));
}

/* Índice de un nodo raíz a partir de su <li> */
function _indiceNodoRaiz(li) {
    if (!li) return -1;
    if (li.dataset.item)  return _raiz.findIndex(n => n.tipo === 'item'  && n.item.id_menu == li.dataset.item);
    if (li.dataset.super) return _raiz.findIndex(n => n.tipo === 'super' && n.super.id_super == li.dataset.super);
    return -1;
}

/* Quita un ItemMenu de donde esté (raíz o SuperMenu) y lo devuelve */
function _extraerItem(id) {
    const i = _raiz.findIndex(n => n.tipo === 'item' && n.item.id_menu == id);
    if (i >= 0) return _raiz.splice(i, 1)[0].item;
    for (const n of _raiz) {
        if (n.tipo !== 'super') continue;
        const j = n.items.findIndex(x => x.id_menu == id);
        if (j >= 0) return n.items.splice(j, 1)[0];
    }
    return null;
}

function _soltarItem(id, destino, refEl) {
    if (refEl && refEl.dataset.item == id) return; // soltado sobre sí mismo

    const item = _extraerItem(id);
    if (!item) return;

    if (destino.superId != null) {
        const nodo = _raiz.find(n => n.tipo === 'super' && n.super.id_super === destino.superId);
        if (!nodo) { renderOrganizador(); return; }
        if (item.modulo === 'dashboard') {
            mostrarAlerta('El Dashboard no puede agruparse: siempre queda en el nivel raíz.', 'warning');
            _raiz.unshift({ tipo: 'item', item });
        } else {
            let pos = nodo.items.length;
            if (refEl?.dataset.item) {
                const i = nodo.items.findIndex(x => x.id_menu == refEl.dataset.item);
                if (i >= 0) pos = i;
            }
            nodo.items.splice(pos, 0, item);
        }
    } else {
        const i = _indiceNodoRaiz(refEl);
        _raiz.splice(i >= 0 ? i : _raiz.length, 0, { tipo: 'item', item });
    }

    renderOrganizador();
    guardarOrganizacion();
}

function _soltarSuper(id, refEl) {
    if (refEl && refEl.dataset.super == id) return;

    const idx = _raiz.findIndex(n => n.tipo === 'super' && n.super.id_super === id);
    if (idx < 0) return;
    const [nodo] = _raiz.splice(idx, 1);

    const i = _indiceNodoRaiz(refEl);
    _raiz.splice(i >= 0 ? i : _raiz.length, 0, nodo);

    renderOrganizador();
    guardarOrganizacion();
}

/* Secuencia única de orden en la raíz; los ItemMenus de cada
   SuperMenu llevan su propio orden interno */
function _payloadOrganizacion() {
    const supers = [];
    const items  = [];
    let orden = 1;
    _raiz.forEach(n => {
        if (n.tipo === 'super') {
            supers.push({ id_super: n.super.id_super, orden: orden++ });
            n.items.forEach((it, i) => {
                items.push({ id_menu: it.id_menu, id_super: n.super.id_super, orden: i + 1 });
            });
        } else {
            items.push({ id_menu: n.item.id_menu, id_super: null, orden: orden++ });
        }
    });
    return { token: Sesion.token(), supers, items };
}

/* Guardado automático tras cada movimiento */
async function guardarOrganizacion() {
    try {
        const r = await postJSON(API.menu.organizar, _payloadOrganizacion());
        if (!r.ok) mostrarAlerta(r.msg, 'error');
    } catch { mostrarAlerta('Error al guardar el menú.', 'error'); }
}

/* Guardar explícito: persiste, refresca el organizador y actualiza
   el sidebar del shell sin cerrar sesión */
async function guardarMenu() {
    try {
        const r = await postJSON(API.menu.organizar, _payloadOrganizacion());
        if (!r.ok) { mostrarAlerta(r.msg, 'error'); return; }

        await cargarMiMenu();

        const p = window.parent;
        if (p !== window && typeof p.cargarMenuYRenderizar === 'function') {
            await p.cargarMenuYRenderizar(document.title.split('—')[0].trim());
            p.Shell?.marcarActivo?.(window.location.pathname);
        }
        mostrarAlerta('Menú guardado y actualizado.', 'ok');
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
    const nodo   = _raiz.find(n => n.tipo === 'super' && n.super.id_super === id);
    const nombre = (window.prompt('Nuevo nombre del SuperMenu:', nodo?.super.nombre || '') || '').trim();
    if (!nombre || nombre === nodo?.super.nombre) return;
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
