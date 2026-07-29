// Validaciones de formularios
const Validaciones = {

    // Borra errores del formulario
    limpiar(form) {
        form.querySelectorAll('.error, .campo-error').forEach(el => {
            el.classList.remove('error', 'campo-error');
        });
        form.querySelectorAll('.form-error.visible, .mensaje-error.visible').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    },

    // Marca campo con mensaje
    mostrar(inputEl, mensaje) {
        inputEl.classList.add('error', 'campo-error');
        const wrapper = inputEl.closest('.input-pass-wrap');
        if (wrapper) wrapper.classList.add('error');
        const container = inputEl.closest('.form-grupo, .campo-grupo') || inputEl.parentElement;
        const errEl = container?.querySelector('.form-error, .mensaje-error');
        if (errEl) {
            errEl.textContent = mensaje;
            errEl.classList.add('visible');
        }
    },

    // Campo obligatorio
    requerido(inputEl, etiqueta) {
        if (!inputEl.value.trim()) {
            this.mostrar(inputEl, `${etiqueta} es requerido.`);
            return false;
        }
        return true;
    },

    // URL válida del menú
    ruta(inputEl) {
        const v = inputEl.value.trim();
        if (!/^\/[A-Za-z0-9_\-\/.]+$/.test(v)) {
            this.mostrar(inputEl, 'La URL debe iniciar con "/" y contener solo letras, números, guiones, puntos y "/".');
            return false;
        }
        return true;
    },

    // Formato de correo
    email(inputEl) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(inputEl.value.trim())) {
            this.mostrar(inputEl, 'Ingrese un correo válido.');
            return false;
        }
        return true;
    },

    // Política de contraseña
    password(inputEl) {
        const v = inputEl.value;
        if (v.length < APP.passMinLength) {
            this.mostrar(inputEl, `Mínimo ${APP.passMinLength} caracteres.`);
            return false;
        }
        if (!/[A-Z]/.test(v)) {
            this.mostrar(inputEl, 'Debe tener al menos una letra mayúscula.');
            return false;
        }
        if (!/[0-9]/.test(v)) {
            this.mostrar(inputEl, 'Debe tener al menos un número.');
            return false;
        }
        if (!/[^A-Za-z0-9]/.test(v)) {
            this.mostrar(inputEl, 'Debe tener al menos un caracter especial.');
            return false;
        }
        return true;
    },

    // Ambas contraseñas coinciden
    confirmarPassword(inputEl, refEl) {
        if (inputEl.value !== refEl.value) {
            this.mostrar(inputEl, 'Las contraseñas no coinciden.');
            return false;
        }
        return true;
    },

    // Texto de la política
    descripcionPolitica() {
        return `Mínimo ${APP.passMinLength} caracteres, una mayúscula, un número y un caracter especial.`;
    },
};
