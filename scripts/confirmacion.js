/* ============================================================
   CONFIRMACION.JS — Confirmación reforzada para eliminaciones
   críticas. Componente único y reutilizable: el botón Eliminar
   permanece deshabilitado hasta que el usuario escribe
   exactamente el nombre del elemento a eliminar (estilo GitHub).

   Uso:
     confirmarEliminacionCritica({
         tipo:     'Rol',
         nombre:   rol.nombre_rol,
         accion:   async () => { ... llamada a la API ... },
     });
   ============================================================ */

let _ceAccionPendiente = null;

function _ceAsegurarModal() {
    if (document.getElementById('modalConfirmarEliminacion')) return;

    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal-overlay" id="modalConfirmarEliminacion">
            <div class="modal modal-peligro">
                <div class="modal-header">
                    <span class="modal-titulo" id="ceTitulo">Eliminar</span>
                    <button type="button" class="modal-cerrar" id="ceBtnCerrar">✕</button>
                </div>
                <div class="modal-body">
                    <p>Esta acción eliminará permanentemente el siguiente elemento:</p>
                    <p class="ce-elemento" id="ceElemento"></p>
                    <p class="ce-advertencia">Esta operación no puede deshacerse.</p>
                    <p id="ceAdvertenciaExtra"></p>
                    <p>Para confirmar la eliminación, escriba exactamente:</p>
                    <p><span class="ce-nombre-esperado" id="ceNombreEsperado"></span></p>
                    <input type="text" class="form-control" id="ceInput" autocomplete="off" spellcheck="false">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="ceBtnCancelar">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="ceBtnEliminar" disabled>Eliminar</button>
                </div>
            </div>
        </div>
    `);

    const overlay = document.getElementById('modalConfirmarEliminacion');
    const input   = document.getElementById('ceInput');
    const btnElim = document.getElementById('ceBtnEliminar');

    // La comparación es exacta: sin recortar espacios ni ignorar mayúsculas
    input.addEventListener('input', () => {
        btnElim.disabled = input.value !== overlay.dataset.nombreEsperado;
    });

    document.getElementById('ceBtnCerrar')?.addEventListener('click', _ceCerrar);
    document.getElementById('ceBtnCancelar')?.addEventListener('click', _ceCerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) _ceCerrar(); });

    btnElim.addEventListener('click', async () => {
        const accion = _ceAccionPendiente;
        _ceCerrar();
        if (accion) await accion();
    });
}

function _ceCerrar() {
    document.getElementById('modalConfirmarEliminacion')?.classList.remove('visible');
    _ceAccionPendiente = null;
}

/**
 * Componente único y reutilizable de confirmación reforzada para
 * eliminaciones críticas (Roles, Usuarios, ItemMenu, SuperMenu, Frames, etc.).
 *
 * @param {Object}   opciones
 * @param {string}   opciones.tipo          Tipo de elemento (ej. "Rol", "ItemMenu").
 * @param {string}   opciones.nombre        Nombre exacto que debe escribirse para confirmar.
 * @param {string}  [opciones.advertencia]  Texto adicional sobre la consecuencia de eliminar.
 * @param {Function} opciones.accion        Función (async) a ejecutar si se confirma.
 */
function confirmarEliminacionCritica({ tipo, nombre, advertencia, accion }) {
    _ceAsegurarModal();

    const overlay = document.getElementById('modalConfirmarEliminacion');
    document.getElementById('ceTitulo').textContent = `Eliminar ${tipo}`;
    document.getElementById('ceElemento').textContent = `${tipo}: ${nombre}`;
    document.getElementById('ceAdvertenciaExtra').textContent = advertencia || '';
    document.getElementById('ceNombreEsperado').textContent = nombre;

    overlay.dataset.nombreEsperado = nombre;

    const input = document.getElementById('ceInput');
    input.value = '';
    document.getElementById('ceBtnEliminar').disabled = true;

    _ceAccionPendiente = accion;
    overlay.classList.add('visible');
    input.focus();
}
