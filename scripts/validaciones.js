/* ============================================================
   VALIDACIONES.JS — Validación de formularios y política de PW
   ============================================================ */

const Validaciones = {

    /* Limpiar todos los errores del formulario */
    limpiar(form) {
        form.querySelectorAll('.error, .campo-error').forEach(el => {
            el.classList.remove('error', 'campo-error');
        });
        form.querySelectorAll('.form-error.visible, .mensaje-error.visible').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    },

    /* Mostrar error en un campo — sube al .form-grupo para encontrar .form-error */
    mostrar(inputEl, mensaje) {
        inputEl.classList.add('error', 'campo-error');
        // Si el input está dentro de un wrapper (.input-pass-wrap), marcarlo también
        const wrapper = inputEl.closest('.input-pass-wrap');
        if (wrapper) wrapper.classList.add('error');
        // Buscar el span de error en el contenedor padre (.form-grupo o .campo-grupo)
        const container = inputEl.closest('.form-grupo, .campo-grupo') || inputEl.parentElement;
        const errEl = container?.querySelector('.form-error, .mensaje-error');
        if (errEl) {
            errEl.textContent = mensaje;
            errEl.classList.add('visible');
        }
    },

    /* Validar campo requerido; retorna false si vacío y muestra error */
    requerido(inputEl, etiqueta) {
        if (!inputEl.value.trim()) {
            this.mostrar(inputEl, `${etiqueta} es requerido.`);
            return false;
        }
        return true;
    },

    /* Validar ruta interna de un ItemMenu: debe iniciar con "/" */
    ruta(inputEl) {
        const v = inputEl.value.trim();
        if (!/^\/[A-Za-z0-9_\-\/.]+$/.test(v)) {
            this.mostrar(inputEl, 'La URL debe iniciar con "/" y contener solo letras, números, guiones, puntos y "/".');
            return false;
        }
        return true;
    },

    /* Validar email */
    email(inputEl) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(inputEl.value.trim())) {
            this.mostrar(inputEl, 'Ingrese un correo válido.');
            return false;
        }
        return true;
    },

    /* Política de contraseña: mín 8 chars, 1 mayús, 1 número, 1 especial */
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

    /* Validar que dos contraseñas coincidan */
    confirmarPassword(inputEl, refEl) {
        if (inputEl.value !== refEl.value) {
            this.mostrar(inputEl, 'Las contraseñas no coinciden.');
            return false;
        }
        return true;
    },

    /* Texto descriptivo de política para mostrar al usuario */
    descripcionPolitica() {
        return `Mínimo ${APP.passMinLength} caracteres, una mayúscula, un número y un caracter especial.`;
    },
};
