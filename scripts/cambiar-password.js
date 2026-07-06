/* ============================================================
   CAMBIAR-PASSWORD.JS — Formulario de cambio de contraseña
   ============================================================ */

async function iniciarCambiarPassword() {
    const ok = await Router.proteger();
    if (!ok) return;

    const user = Sesion.usuario();

    if (user?.primer_login == 1) {
        const aviso = document.getElementById('avisoObligatorio');
        aviso?.classList.remove('d-none');
    }

    document.getElementById('formCambiarPassword')?.addEventListener('submit', submitCambiarPassword);
    document.getElementById('btnCancelar')?.addEventListener('click', () => {
        const user = Sesion.usuario();
        if (user?.primer_login == 1) {
            mostrarAlerta('Debe cambiar su contraseña antes de continuar.', 'warning');
        } else {
            Router.irA(RUTAS.dashboard);
        }
    });

    // Toggle visibilidad de contraseñas
    ['toggleActual', 'toggleNueva', 'toggleConfirmar'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', function() {
            const inputId = this.dataset.target;
            const input   = document.getElementById(inputId);
            if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            this.textContent = input.type === 'password' ? '👁' : '🙈';
        });
    });

    // Indicador de fortaleza
    document.getElementById('txtNuevoPassword')?.addEventListener('input', actualizarFortaleza);
}

function actualizarFortaleza() {
    const v       = document.getElementById('txtNuevoPassword').value;
    const barra   = document.getElementById('barraFortaleza');
    const etiqueta = document.getElementById('etiquetaFortaleza');
    if (!barra) return;

    let puntaje = 0;
    if (v.length >= 8)          puntaje++;
    if (/[A-Z]/.test(v))        puntaje++;
    if (/[0-9]/.test(v))        puntaje++;
    if (/[^A-Za-z0-9]/.test(v)) puntaje++;

    const colores  = ['#dc2626','#f59e0b','#3b82f6','#16a34a'];
    const etiquetas = ['Débil','Regular','Buena','Fuerte'];

    barra.style.width      = `${puntaje * 25}%`;
    barra.style.background = colores[puntaje - 1] || '#e2e8f0';
    if (etiqueta) etiqueta.textContent = puntaje > 0 ? etiquetas[puntaje - 1] : '';
}

async function submitCambiarPassword(e) {
    e.preventDefault();
    const form = e.target;
    Validaciones.limpiar(form);

    const actual     = document.getElementById('txtPasswordActual');
    const nueva      = document.getElementById('txtNuevoPassword');
    const confirmar_ = document.getElementById('txtConfirmarPassword');

    let valido = true;
    if (!Validaciones.requerido(actual, 'Contraseña actual')) valido = false;
    if (!Validaciones.password(nueva))                        valido = false;
    if (!Validaciones.confirmarPassword(confirmar_, nueva))   valido = false;
    if (!valido) return;

    if (nueva.value === actual.value) {
        Validaciones.mostrar(nueva, 'La nueva contraseña debe ser diferente a la actual.');
        return;
    }

    const btnGuardar = document.getElementById('btnGuardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        const r = await postJSON(API.perfil.cambiarPassword, {
            token:            Sesion.token(),
            password_actual:  actual.value,
            password_nuevo:   nueva.value,
        });

        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';

        if (r.ok) {
            mostrarAlerta(r.msg, 'ok');
            // Actualizar primer_login en sesión
            const user = Sesion.usuario();
            if (user) {
                user.primer_login = 0;
                sessionStorage.setItem(APP.keys.usuario, JSON.stringify(user));
            }
            setTimeout(() => Router.irA(RUTAS.dashboard), 1500);
        } else {
            mostrarAlerta(r.msg, 'error');
        }
    } catch {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
        mostrarAlerta('Error de conexión.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', iniciarCambiarPassword);
