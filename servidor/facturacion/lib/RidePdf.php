<?php
require_once __DIR__ . '/Catalogos.php';

/**
 * Generador del RIDE (Representación Impresa del Documento Electrónico)
 * de la factura, en versión simplificada del formato del Anexo 2 de la
 * Ficha Técnica de Comprobantes Electrónicos del SRI (v2.32): bloque del
 * emisor, bloque del documento con clave de acceso, datos del comprador,
 * detalle y totales desglosados por tarifa de IVA.
 *
 * El PDF (1.4) se construye sin dependencias externas, en línea con la
 * filosofía "sin frameworks" del proyecto: fuentes base Type1
 * (Helvetica para etiquetas, Courier para valores alineados, cuyo ancho
 * fijo garantiza la alineación) con codificación WinAnsi.
 */
class RidePdf
{
    const W      = 595.28;   // A4 vertical, en puntos
    const H      = 841.89;
    const MARGEN = 38;
    const LIMITE = 790;      // y máximo utilizable (medido desde arriba)

    private $paginas = [];   // streams de contenido ya cerrados
    private $pag     = '';   // stream de la página en curso

    /* ── API pública ─────────────────────────────────────────── */
    public static function factura(array $emisor, array $factura, array $detalles): string
    {
        $r = new self();
        return $r->construir($emisor, $factura, $detalles);
    }

    private function construir(array $emisor, array $factura, array $detalles): string
    {
        $this->pag = "0.5 w\n";
        $this->cabecera($emisor, $factura);
        $y = $this->comprador($factura);
        $y = $this->tablaDetalle($detalles, $y);
        $this->totales($factura, $detalles, $y);
        return $this->ensamblar();
    }

    /* ── Secciones del RIDE ──────────────────────────────────── */
    private function cabecera(array $emisor, array $factura): void
    {
        $m = self::MARGEN;

        // Caja del emisor (izquierda)
        $this->rect($m, 40, 252, 135);
        $x = $m + 8; $yy = 56;
        foreach ($this->envolver($emisor['razon_social'], 44) as $l) { $this->tx($x, $yy, $l, 'F2', 9); $yy += 11; }
        if (!empty($emisor['nombre_comercial'])) {
            foreach ($this->envolver($emisor['nombre_comercial'], 50) as $l) { $this->tx($x, $yy, $l, 'F1', 8); $yy += 10; }
        }
        $yy += 4;
        $this->tx($x, $yy, 'Dirección Matriz:', 'F2', 7); $yy += 9;
        foreach ($this->envolver($emisor['dir_matriz'], 58) as $l) { $this->tx($x, $yy, $l, 'F1', 7); $yy += 9; }
        $yy += 4;
        $this->tx($x, $yy, 'Obligado a llevar contabilidad: ' . $emisor['obligado_contabilidad'], 'F1', 7); $yy += 9;
        if (!empty($emisor['contribuyente_especial'])) {
            $this->tx($x, $yy, 'Contribuyente Especial Nro: ' . $emisor['contribuyente_especial'], 'F1', 7);
        }

        // Caja del documento (derecha). En el esquema offline el número
        // de autorización es la propia clave de acceso.
        $xd = 302;
        $this->rect($xd, 40, self::W - $m - $xd, 135);
        $x = $xd + 8; $yy = 56;
        $this->tx($x, $yy, 'R.U.C.: ' . $emisor['ruc'], 'F2', 10); $yy += 15;
        $this->tx($x, $yy, 'FACTURA', 'F2', 12); $yy += 13;
        $this->tx($x, $yy, 'No. ' . $factura['establecimiento'] . '-' . $factura['punto_emision'] . '-' . $factura['secuencial'], 'F1', 9); $yy += 13;
        $this->tx($x, $yy, 'NÚMERO DE AUTORIZACIÓN:', 'F2', 7); $yy += 9;
        $this->tx($x, $yy, $factura['clave_acceso'], 'F3', 6.5); $yy += 11;
        $this->tx($x, $yy, 'FECHA Y HORA DE GENERACIÓN:', 'F2', 7); $yy += 9;
        $this->tx($x, $yy, $factura['created_at'], 'F1', 7); $yy += 11;
        $this->tx($x, $yy, 'AMBIENTE: ' . ($factura['ambiente'] == '2' ? 'PRODUCCIÓN' : 'PRUEBAS'), 'F1', 7); $yy += 9;
        $this->tx($x, $yy, 'EMISIÓN: NORMAL', 'F1', 7); $yy += 11;
        $this->tx($x, $yy, 'CLAVE DE ACCESO:', 'F2', 7); $yy += 9;
        $this->tx($x, $yy, $factura['clave_acceso'], 'F3', 6.5);
    }

    private function comprador(array $factura): float
    {
        $m = self::MARGEN;
        $this->rect($m, 185, self::W - 2 * $m, 50);
        $x = $m + 8;
        $this->tx($x, 199, 'Razón Social / Nombres y Apellidos: ' . $factura['razon_social_comprador'], 'F1', 8);
        $this->tx($x, 211, 'Identificación: ' . $factura['identificacion_comprador'], 'F1', 8);
        $this->tx($x + 260, 211, 'Fecha de Emisión: ' . date('d/m/Y', strtotime($factura['fecha_emision'])), 'F1', 8);
        $this->tx($x, 223, 'Dirección: ' . ($factura['direccion_comprador'] ?: '—'), 'F1', 8);
        return 247;
    }

    private function tablaDetalle(array $detalles, float $y): float
    {
        $cols = [self::MARGEN, 98, 300, 352, 424, 486, self::W - self::MARGEN];
        $alto = 11;

        $yTop = $y;
        $this->cabeceraTabla($cols, $yTop);
        $yFila = $yTop + 16;

        foreach ($detalles as $d) {
            if ($yFila + $alto > self::LIMITE) {
                $this->rejilla($cols, $yTop, $yFila);
                $this->nuevaPagina();
                $yTop = 50;
                $this->cabeceraTabla($cols, $yTop);
                $yFila = $yTop + 16;
            }
            $yb = $yFila + 8;
            $desc = $d['descripcion'] . (!empty($d['unidad']) ? " ({$d['unidad']})" : '');
            $this->tx($cols[0] + 3, $yb, $this->recortar($d['codigo_principal'], 13), 'F3', 7);
            $this->tx($cols[1] + 3, $yb, $this->recortar($desc, 46), 'F3', 7);
            $this->txDer($cols[3] - 3, $yb, number_format((float)$d['cantidad'], 2, '.', ''), 'F3', 7);
            $this->txDer($cols[4] - 3, $yb, number_format((float)$d['precio_unitario'], 6, '.', ''), 'F3', 7);
            $this->txDer($cols[5] - 3, $yb, number_format((float)$d['descuento'], 2, '.', ''), 'F3', 7);
            $this->txDer($cols[6] - 3, $yb, number_format((float)$d['precio_total_sin_impuesto'], 2, '.', ''), 'F3', 7);
            $yFila += $alto;
        }
        $this->rejilla($cols, $yTop, $yFila);
        return $yFila + 10;
    }

    private function cabeceraTabla(array $cols, float $yTop): void
    {
        $yb = $yTop + 11;
        $this->tx($cols[0] + 3, $yb, 'Cod. Principal', 'F2', 7);
        $this->tx($cols[1] + 3, $yb, 'Descripción', 'F2', 7);
        $this->txDer($cols[3] - 3, $yb, 'Cantidad', 'F2', 7);
        $this->txDer($cols[4] - 3, $yb, 'Precio Unitario', 'F2', 7);
        $this->txDer($cols[5] - 3, $yb, 'Descuento', 'F2', 7);
        $this->txDer($cols[6] - 3, $yb, 'Precio Total', 'F2', 7);
    }

    private function rejilla(array $cols, float $yTop, float $yFin): void
    {
        $this->rect($cols[0], $yTop, $cols[count($cols) - 1] - $cols[0], $yFin - $yTop);
        $this->linea($cols[0], $yTop + 16, $cols[count($cols) - 1], $yTop + 16);
        for ($i = 1; $i < count($cols) - 1; $i++) {
            $this->linea($cols[$i], $yTop, $cols[$i], $yFin);
        }
    }

    private function totales(array $factura, array $detalles, float $y): void
    {
        // Bases imponibles agrupadas por código de tarifa (Tabla 17 SRI)
        $bases = ['0' => 0.0, '4' => 0.0, '6' => 0.0, '7' => 0.0];
        foreach ($detalles as $d) {
            $cod = $d['codigo_porcentaje_iva'];
            if (!isset($bases[$cod])) $bases[$cod] = 0.0;
            $bases[$cod] += (float)$d['base_imponible_iva'];
        }

        $filas = [
            ['SUBTOTAL 15%',              $bases['4']],
            ['SUBTOTAL 0%',               $bases['0']],
            ['SUBTOTAL NO OBJETO DE IVA', $bases['6']],
            ['SUBTOTAL EXENTO DE IVA',    $bases['7']],
            ['SUBTOTAL SIN IMPUESTOS',    (float)$factura['total_sin_impuestos']],
            ['TOTAL DESCUENTO',           (float)$factura['total_descuento']],
            ['IVA 15%',                   (float)$factura['total_iva']],
            ['PROPINA',                   (float)$factura['propina']],
            ['VALOR TOTAL',               (float)$factura['importe_total']],
        ];

        $alto = 12;
        if ($y + count($filas) * $alto > self::LIMITE) {
            $this->nuevaPagina();
            $y = 50;
        }

        // Bloque de totales (derecha)
        $x1 = 352; $x2 = 486; $x3 = self::W - self::MARGEN;
        $yy = $y;
        foreach ($filas as $fila) {
            $bold = $fila[0] === 'VALOR TOTAL';
            $this->rect($x1, $yy, $x2 - $x1, $alto);
            $this->rect($x2, $yy, $x3 - $x2, $alto);
            $this->txDer($x2 - 4, $yy + 8.5, $fila[0], $bold ? 'F4' : 'F3', 7);
            $this->txDer($x3 - 4, $yy + 8.5, number_format($fila[1], 2, '.', ''), $bold ? 'F4' : 'F3', 7);
            $yy += $alto;
        }

        // Forma de pago y moneda (izquierda)
        $fp = Catalogos::FORMA_PAGO[$factura['forma_pago']] ?? $factura['forma_pago'];
        $this->rect(self::MARGEN, $y, 292, 28);
        $this->tx(self::MARGEN + 6, $y + 11, 'Forma de pago: ' . $fp, 'F1', 8);
        $this->tx(self::MARGEN + 6, $y + 22, 'Moneda: DÓLAR', 'F1', 8);
    }

    /* ── Primitivas de dibujo (y medido desde el borde superior) ── */
    private function tx(float $x, float $y, string $txt, string $f = 'F1', float $tam = 8): void
    {
        $this->pag .= sprintf("BT /%s %.2F Tf %.2F %.2F Td (%s) Tj ET\n",
            $f, $tam, $x, self::H - $y, $this->cod($txt));
    }

    private function txDer(float $xDer, float $y, string $txt, string $f = 'F3', float $tam = 8): void
    {
        $this->tx($xDer - $this->ancho($txt, $f, $tam), $y, $txt, $f, $tam);
    }

    private function rect(float $x, float $y, float $w, float $h): void
    {
        $this->pag .= sprintf("%.2F %.2F %.2F %.2F re S\n", $x, self::H - $y - $h, $w, $h);
    }

    private function linea(float $x1, float $y1, float $x2, float $y2): void
    {
        $this->pag .= sprintf("%.2F %.2F m %.2F %.2F l S\n", $x1, self::H - $y1, $x2, self::H - $y2);
    }

    private function nuevaPagina(): void
    {
        $this->paginas[] = $this->pag;
        $this->pag = "0.5 w\n";
    }

    /* ── Texto: codificación, medidas y ajuste ───────────────── */

    // Courier tiene ancho fijo exacto (0.6 em); para Helvetica se usa un
    // promedio, suficiente porque solo alinea a la izquierda o cabeceras.
    private function ancho(string $txt, string $f, float $tam): float
    {
        $factor = ($f === 'F3' || $f === 'F4') ? 0.60 : 0.52;
        return strlen($this->lat($txt)) * $factor * $tam;
    }

    private function lat(string $txt): string
    {
        $r = @iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $txt);
        return $r === false ? $txt : $r;
    }

    private function cod(string $txt): string
    {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $this->lat($txt));
    }

    private function recortar(string $txt, int $max): string
    {
        return mb_strlen($txt, 'UTF-8') <= $max ? $txt : mb_substr($txt, 0, $max - 1, 'UTF-8') . '…';
    }

    private function envolver(string $txt, int $max): array
    {
        $lineas = []; $actual = '';
        foreach (explode(' ', $txt) as $p) {
            $prueba = $actual === '' ? $p : "$actual $p";
            if (mb_strlen($prueba, 'UTF-8') > $max && $actual !== '') {
                $lineas[] = $actual;
                $actual   = $p;
            } else {
                $actual = $prueba;
            }
        }
        if ($actual !== '') $lineas[] = $actual;
        return array_slice($lineas, 0, 3); // límite defensivo de líneas
    }

    /* ── Ensamblado del archivo PDF ──────────────────────────── */
    private function ensamblar(): string
    {
        $this->paginas[] = $this->pag;

        $fuentes = ['F1' => 'Helvetica', 'F2' => 'Helvetica-Bold', 'F3' => 'Courier', 'F4' => 'Courier-Bold'];

        // Objetos: 1 catálogo, 2 árbol de páginas, 3-6 fuentes,
        // y por cada página: objeto de página + stream de contenido.
        $objetos    = [1 => '<< /Type /Catalog /Pages 2 0 R >>'];
        $n          = 3;
        $refsFuente = [];
        foreach ($fuentes as $alias => $base) {
            $objetos[$n]  = "<< /Type /Font /Subtype /Type1 /BaseFont /$base /Encoding /WinAnsiEncoding >>";
            $refsFuente[] = "/$alias $n 0 R";
            $n++;
        }
        $recursos = '<< /Font << ' . implode(' ', $refsFuente) . ' >> >>';

        $kids = [];
        foreach ($this->paginas as $stream) {
            $numPag  = $n++;
            $numCont = $n++;
            $kids[]  = "$numPag 0 R";
            $objetos[$numPag]  = sprintf(
                '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 %.2F %.2F] /Resources %s /Contents %d 0 R >>',
                self::W, self::H, $recursos, $numCont
            );
            $objetos[$numCont] = sprintf("<< /Length %d >>\nstream\n%sendstream", strlen($stream), $stream);
        }
        $objetos[2] = '<< /Type /Pages /Kids [' . implode(' ', $kids) . '] /Count ' . count($kids) . ' >>';
        ksort($objetos);

        $pdf     = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objetos as $num => $cuerpo) {
            $offsets[$num] = strlen($pdf);
            $pdf .= "$num 0 obj\n$cuerpo\nendobj\n";
        }

        $inicioXref = strlen($pdf);
        $total      = count($objetos) + 1;
        $pdf .= "xref\n0 $total\n0000000000 65535 f \n";
        for ($i = 1; $i < $total; $i++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$i]);
        }
        $pdf .= "trailer\n<< /Size $total /Root 1 0 R >>\nstartxref\n$inicioXref\n%%EOF";
        return $pdf;
    }
}
