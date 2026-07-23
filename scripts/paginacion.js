/* ============================================================
   PAGINACION.JS — Paginador reutilizable para tablas.

   Divide un arreglo de datos en páginas con un selector de
   "Mostrar N registros" (persistido por tabla en sessionStorage)
   y controles de navegación. No conoce la estructura de las
   filas: delega el pintado de cada página en un callback, de modo
   que cualquier tabla del sistema puede paginarse sin duplicar
   lógica de renderizado.

   Uso:
     const pag = crearPaginador({
         clave:   'clientes',           // id único (persistencia + DOM)
         tbodyId: 'tbodyClientes',       // <tbody> a paginar
         etiqueta:'clientes',            // sustantivo para "de N clientes"
         pintar:  (filas, offset) => {   // rellena el <tbody> con la página
             tbody.innerHTML = filas.map((x, i) => `... ${offset + i + 1} ...`).join('');
         },
     });
     pag.render(datosFiltrados);                 // repinta (conserva página)
     pag.render(datosFiltrados, { reiniciar:true }); // vuelve a la página 1
   ============================================================ */

const PAGINACION_TAMANOS = [10, 20, 50, 100];

function crearPaginador({ clave, tbodyId, pintar, tamanos = PAGINACION_TAMANOS, etiqueta = 'registros' }) {
    const claveStorage = 'paginacion_' + clave;
    let tamano = _leerTamano();
    let pagina = 1;
    let datos  = [];

    function _leerTamano() {
        const v = parseInt(sessionStorage.getItem(claveStorage), 10);
        return tamanos.includes(v) ? v : tamanos[0];
    }

    function _pie() {
        const wrap = document.getElementById(tbodyId)?.closest('.tabla-wrap');
        if (!wrap) return null;
        let pie = wrap.parentNode.querySelector(`[data-paginacion="${clave}"]`);
        if (!pie) {
            pie = document.createElement('div');
            pie.className = 'tabla-paginacion';
            pie.dataset.paginacion = clave;
            wrap.insertAdjacentElement('afterend', pie);
        }
        return pie;
    }

    function render(nuevosDatos, opciones = {}) {
        datos = Array.isArray(nuevosDatos) ? nuevosDatos : [];
        if (opciones.reiniciar) pagina = 1;

        const totalPaginas = Math.max(1, Math.ceil(datos.length / tamano));
        if (pagina > totalPaginas) pagina = totalPaginas;

        const inicio = (pagina - 1) * tamano;
        pintar(datos.slice(inicio, inicio + tamano), inicio);
        _controles(totalPaginas, inicio);
    }

    function _controles(totalPaginas, inicio) {
        const pie = _pie();
        if (!pie) return;

        const total = datos.length;
        const desde = total === 0 ? 0 : inicio + 1;
        const hasta = Math.min(inicio + tamano, total);
        const opciones = tamanos.map(t => `<option value="${t}" ${t === tamano ? 'selected' : ''}>${t}</option>`).join('');

        let botones = '';
        if (totalPaginas > 1) {
            const btn = (p, txt, dis, activo) =>
                `<button type="button" class="pag-btn${activo ? ' activo' : ''}" ${dis ? 'disabled' : ''} data-pag="${p}">${txt}</button>`;
            botones += btn(pagina - 1, '‹', pagina === 1, false);
            for (const p of _rango(pagina, totalPaginas)) {
                botones += p === '…' ? `<span class="pag-ellipsis">…</span>` : btn(p, p, false, p === pagina);
            }
            botones += btn(pagina + 1, '›', pagina === totalPaginas, false);
        }

        pie.innerHTML = `
            <div class="pag-info">Mostrando ${desde}–${hasta} de ${total} ${esc(etiqueta)}</div>
            <div class="pag-controles">
                <label class="pag-select-label">Mostrar
                    <select class="form-control pag-select">${opciones}</select>
                </label>
                <div class="pag-botones">${botones}</div>
            </div>`;

        pie.querySelector('.pag-select').addEventListener('change', e => {
            tamano = parseInt(e.target.value, 10);
            sessionStorage.setItem(claveStorage, String(tamano));
            pagina = 1;
            render(datos);
        });
        pie.querySelectorAll('.pag-btn[data-pag]').forEach(b => {
            b.addEventListener('click', () => {
                const p = parseInt(b.dataset.pag, 10);
                if (p >= 1 && p <= totalPaginas && p !== pagina) { pagina = p; render(datos); }
            });
        });
    }

    /* Ventana compacta de páginas: 1 … (a-1) a (a+1) … total */
    function _rango(actual, total) {
        const set = new Set([1, total, actual, actual - 1, actual + 1]);
        const orden = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
        const res = [];
        let prev = 0;
        for (const p of orden) {
            if (p - prev > 1) res.push('…');
            res.push(p);
            prev = p;
        }
        return res;
    }

    return { render };
}
