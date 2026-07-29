// Acción a confirmar
let _ceAccionPendiente = null;

// Crea el modal
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

    // Exige escribir el nombre
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

// Cierra y cancela
function _ceCerrar() {
    document.getElementById('modalConfirmarEliminacion')?.classList.remove('visible');
    _ceAccionPendiente = null;
}

// Confirma borrado escribiendo nombre
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
