/* ============================================================
   AUTH.JS — Login, captcha canvas, logout
   ============================================================ */

/* ── Estado local ────────────────────────────────────────────── */
let _intentosLocales = 0;
let _bloqueadoHasta  = 0;

/* ── Captcha ─────────────────────────────────────────────────── */
function generarCaptcha() {
    const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let   texto  = '';
    for (let i = 0; i < 6; i++) {
        texto += chars[Math.floor(Math.random() * chars.length)];
    }

    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo degradado
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0,   '#e8edf5');
    grad.addColorStop(1,   '#f0f4fb');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Líneas de ruido
    for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(${_rnd(100,180)},${_rnd(100,180)},${_rnd(100,180)},.35)`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(_rnd(0, canvas.width),  _rnd(0, canvas.height));
        ctx.lineTo(_rnd(0, canvas.width),  _rnd(0, canvas.height));
        ctx.stroke();
    }

    // Caracteres con rotación y color variables
    for (let i = 0; i < texto.length; i++) {
        ctx.save();
        ctx.translate(12 + i * 32, 36 + _rnd(-5, 5));
        ctx.rotate((_rnd(-30, 30)) * Math.PI / 180);
        ctx.font      = `bold ${_rnd(22, 28)}px Arial`;
        ctx.fillStyle = `hsl(${_rnd(200, 260)}, 70%, 30%)`;
        ctx.fillText(texto[i], 0, 0);
        ctx.restore();
    }

    // Puntos de ruido
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${_rnd(0,150)},${_rnd(0,150)},${_rnd(0,150)},.25)`;
        ctx.fillRect(_rnd(0, canvas.width), _rnd(0, canvas.height), 2, 2);
    }

    sessionStorage.setItem('captcha_texto', texto);
    sessionStorage.setItem('captcha_ts',    Date.now());
}

function _rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function validarCaptcha(inputVal) {
    const ts     = parseInt(sessionStorage.getItem('captcha_ts') || '0');
    const texto  = sessionStorage.getItem('captcha_texto') || '';
    if (Date.now() - ts > APP.captchaExpMs) { generarCaptcha(); return false; }
    return inputVal.trim().toLowerCase() === texto.toLowerCase();
}

/* ── Bloqueo por intentos ────────────────────────────────────── */
function leerBloqueo() {
    const b = sessionStorage.getItem('login_bloqueo');
    if (b) {
        const obj = JSON.parse(b);
        _intentosLocales = obj.intentos || 0;
        _bloqueadoHasta  = obj.hasta    || 0;
    }
}

function guardarBloqueo() {
    sessionStorage.setItem('login_bloqueo', JSON.stringify({
        intentos: _intentosLocales,
        hasta:    _bloqueadoHasta,
    }));
}

function estaBloqueado() {
    if (_bloqueadoHasta && Date.now() < _bloqueadoHasta) return true;
    if (_bloqueadoHasta && Date.now() >= _bloqueadoHasta) {
        _bloqueadoHasta  = 0;
        _intentosLocales = 0;
        guardarBloqueo();
    }
    return false;
}

function registrarIntento() {
    _intentosLocales++;
    if (_intentosLocales >= APP.maxIntentos) {
        _bloqueadoHasta  = Date.now() + APP.bloqueoMs;
        _intentosLocales = APP.maxIntentos;
    }
    guardarBloqueo();
}

function resetearBloqueo() {
    _intentosLocales = 0;
    _bloqueadoHasta  = 0;
    sessionStorage.removeItem('login_bloqueo');
}

/* ── Actualizar UI de bloqueo ────────────────────────────────── */
function actualizarUiBloqueo() {
    const divBloqueo = document.getElementById('msgBloqueo');
    const btnLogin   = document.getElementById('btnLogin');
    if (!divBloqueo || !btnLogin) return;

    if (estaBloqueado()) {
        const resta = Math.ceil((_bloqueadoHasta - Date.now()) / 1000 / 60);
        divBloqueo.textContent = `Acceso bloqueado por intentos fallidos. Intente en ${resta} minuto(s).`;
        divBloqueo.classList.add('visible');
        btnLogin.disabled = true;
    } else {
        divBloqueo.classList.remove('visible');
        btnLogin.disabled = false;
    }
}

/* ── Submit del formulario de login ──────────────────────────── */
async function submitLogin(e) {
    e.preventDefault();

    if (estaBloqueado()) { actualizarUiBloqueo(); return; }

    const inUser    = document.getElementById('txtUsuario');
    const inPass    = document.getElementById('txtPassword');
    const inCaptcha = document.getElementById('txtCaptcha');
    const btnLogin  = document.getElementById('btnLogin');

    // Validar campos locales
    let ok = true;
    if (!inUser.value.trim()) {
        mostrarError(inUser, 'Ingrese su usuario.');
        ok = false;
    }
    if (!inPass.value.trim()) {
        mostrarError(inPass, 'Ingrese su contraseña.');
        ok = false;
    }
    if (!inCaptcha.value.trim()) {
        mostrarError(inCaptcha, 'Ingrese el captcha.');
        ok = false;
    } else if (!validarCaptcha(inCaptcha.value)) {
        mostrarError(inCaptcha, 'Captcha incorrecto. Refresque e intente de nuevo.');
        generarCaptcha();
        inCaptcha.value = '';
        ok = false;
    }
    if (!ok) return;

    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';

    try {
        const r = await postJSON(API.auth.login, {
            username: inUser.value.trim(),
            password: inPass.value,
        });

        if (r.ok) {
            resetearBloqueo();
            Sesion.guardar(r.data);

            const user = r.data.usuario;
            if (user && user.primer_login == 1) {
                window.location.replace(RUTAS.cambiarPassword);
            } else {
                window.location.replace(RUTAS.dashboard);
            }
        } else {
            registrarIntento();
            actualizarUiBloqueo();
            mostrarAlerta(r.msg || 'Usuario o contraseña incorrectos.', 'error');
            generarCaptcha();
            inCaptcha.value = '';
            inPass.value    = '';
            btnLogin.disabled    = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    } catch (err) {
        mostrarAlerta('Error de conexión. Verifique el servidor.', 'error');
        btnLogin.disabled    = false;
        btnLogin.textContent = 'Iniciar Sesión';
    }
}

function mostrarError(inputEl, msg) {
    inputEl.classList.add('campo-error');
    const errEl = inputEl.closest('.campo-grupo')?.querySelector('.mensaje-error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
}

function limpiarErrores() {
    document.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));
    document.querySelectorAll('.mensaje-error.visible').forEach(el => {
        el.textContent = ''; el.classList.remove('visible');
    });
}

/* ── Logout ──────────────────────────────────────────────────── */
async function logout() {
    const token = Sesion.token();
    Sesion.limpiar();
    try { await postJSON(API.auth.logout, { token }); } catch { /* ignorar */ }
    window.location.replace(RUTAS.login);
}

/* ── Inicializar página de login (solo si existe el formulario) ── */
document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formLogin');
    if (!form) return; // auth.js se incluye en todas las páginas; aquí solo ejecuta en login

    const redirigido = await Router.redirigirSiAutenticado();
    if (redirigido) return;
    Router.enmascarar();

    leerBloqueo();
    actualizarUiBloqueo();
    generarCaptcha();

    const btnRef = document.getElementById('btnRefrescarCaptcha');
    const canvas = document.getElementById('captchaCanvas');
    const inUser = document.getElementById('txtUsuario');
    const inPass = document.getElementById('txtPassword');
    const inCap  = document.getElementById('txtCaptcha');

    form.addEventListener('submit', submitLogin);
    btnRef?.addEventListener('click', () => { generarCaptcha(); inCap.value = ''; inCap.focus(); });
    canvas?.addEventListener('click', () => { generarCaptcha(); inCap.value = ''; inCap.focus(); });

    [inUser, inPass, inCap].forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('campo-error');
            const errEl = el.closest('.campo-grupo')?.querySelector('.mensaje-error');
            if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
        });
    });

    /* Mostrar/ocultar contraseña sin perder el foco del campo */
    const btnToggle = document.getElementById('togglePassword');
    btnToggle?.addEventListener('mousedown', e => e.preventDefault());
    btnToggle?.addEventListener('click', () => {
        inPass.type = inPass.type === 'password' ? 'text' : 'password';
        btnToggle.textContent = inPass.type === 'password' ? '👁' : '🙈';
        btnToggle.setAttribute('aria-label',
            inPass.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
    });

    setInterval(actualizarUiBloqueo, 1000);
});
