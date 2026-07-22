<?php
/**
 * Construye el XML de la Factura Electrónica (codDoc 01) conforme al
 * esquema del SRI (factura v1.1.0): respeta nombres, jerarquía y orden
 * de etiquetas. No agrega campos fuera del esquema ni firma el
 * documento (ver pendientes en README del módulo).
 *
 * @param array $emisor   fila de `factura_emisor`
 * @param array $factura  cabecera calculada (ver facturas_crear.php)
 * @param array $detalles líneas ya calculadas por CalculadoraFactura
 */
class FacturaXmlBuilder
{
    public static function construir(array $emisor, array $factura, array $detalles): DOMDocument
    {
        $doc = new DOMDocument('1.0', 'UTF-8');
        $doc->formatOutput = true;

        $raiz = $doc->createElement('factura');
        $raiz->setAttribute('id', 'comprobante');
        $raiz->setAttribute('version', '1.1.0');
        $doc->appendChild($raiz);

        // ---- infoTributaria ----
        $infoTrib = $doc->createElement('infoTributaria');
        $raiz->appendChild($infoTrib);
        self::agregar($doc, $infoTrib, 'ambiente', $factura['ambiente']);
        self::agregar($doc, $infoTrib, 'tipoEmision', $factura['tipo_emision']);
        self::agregar($doc, $infoTrib, 'razonSocial', $emisor['razon_social']);
        if (!empty($emisor['nombre_comercial'])) {
            self::agregar($doc, $infoTrib, 'nombreComercial', $emisor['nombre_comercial']);
        }
        self::agregar($doc, $infoTrib, 'ruc', $emisor['ruc']);
        self::agregar($doc, $infoTrib, 'claveAcceso', $factura['clave_acceso']);
        self::agregar($doc, $infoTrib, 'codDoc', '01');
        self::agregar($doc, $infoTrib, 'estab', $factura['establecimiento']);
        self::agregar($doc, $infoTrib, 'ptoEmi', $factura['punto_emision']);
        self::agregar($doc, $infoTrib, 'secuencial', $factura['secuencial']);
        self::agregar($doc, $infoTrib, 'dirMatriz', $emisor['dir_matriz']);

        // ---- infoFactura ----
        $infoFac = $doc->createElement('infoFactura');
        $raiz->appendChild($infoFac);
        self::agregar($doc, $infoFac, 'fechaEmision', date('d/m/Y', strtotime($factura['fecha_emision'])));
        if (!empty($emisor['contribuyente_especial'])) {
            self::agregar($doc, $infoFac, 'contribuyenteEspecial', $emisor['contribuyente_especial']);
        }
        self::agregar($doc, $infoFac, 'obligadoContabilidad', $emisor['obligado_contabilidad']);
        self::agregar($doc, $infoFac, 'tipoIdentificacionComprador', $factura['tipo_identificacion_comprador']);
        self::agregar($doc, $infoFac, 'razonSocialComprador', $factura['razon_social_comprador']);
        self::agregar($doc, $infoFac, 'identificacionComprador', $factura['identificacion_comprador']);
        if (!empty($factura['direccion_comprador'])) {
            self::agregar($doc, $infoFac, 'direccionComprador', $factura['direccion_comprador']);
        }
        self::agregar($doc, $infoFac, 'totalSinImpuestos', self::money($factura['total_sin_impuestos']));
        self::agregar($doc, $infoFac, 'totalDescuento', self::money($factura['total_descuento']));

        $totalConImp = $doc->createElement('totalConImpuestos');
        $infoFac->appendChild($totalConImp);
        foreach ($factura['por_iva'] as $codigo => $montos) {
            $ti = $doc->createElement('totalImpuesto');
            $totalConImp->appendChild($ti);
            self::agregar($doc, $ti, 'codigo', '2'); // 2 = IVA
            self::agregar($doc, $ti, 'codigoPorcentaje', $codigo);
            self::agregar($doc, $ti, 'baseImponible', self::money($montos['base']));
            self::agregar($doc, $ti, 'valor', self::money($montos['valor']));
        }

        self::agregar($doc, $infoFac, 'propina', self::money($factura['propina']));
        self::agregar($doc, $infoFac, 'importeTotal', self::money($factura['importe_total']));
        self::agregar($doc, $infoFac, 'moneda', 'DOLAR');

        $pagos = $doc->createElement('pagos');
        $infoFac->appendChild($pagos);
        $pago = $doc->createElement('pago');
        $pagos->appendChild($pago);
        self::agregar($doc, $pago, 'formaPago', $factura['forma_pago']);
        self::agregar($doc, $pago, 'total', self::money($factura['importe_total']));

        // ---- detalles ----
        $detallesEl = $doc->createElement('detalles');
        $raiz->appendChild($detallesEl);
        foreach ($detalles as $d) {
            $det = $doc->createElement('detalle');
            $detallesEl->appendChild($det);
            self::agregar($doc, $det, 'codigoPrincipal', $d['codigo_principal']);
            self::agregar($doc, $det, 'descripcion', $d['descripcion']);
            self::agregar($doc, $det, 'cantidad', number_format($d['cantidad'], 6, '.', ''));
            self::agregar($doc, $det, 'precioUnitario', number_format($d['precio_unitario'], 6, '.', ''));
            self::agregar($doc, $det, 'descuento', self::money($d['descuento']));
            self::agregar($doc, $det, 'precioTotalSinImpuesto', self::money($d['precio_total_sin_impuesto']));

            $imps = $doc->createElement('impuestos');
            $det->appendChild($imps);
            $imp = $doc->createElement('impuesto');
            $imps->appendChild($imp);
            self::agregar($doc, $imp, 'codigo', '2');
            self::agregar($doc, $imp, 'codigoPorcentaje', $d['codigo_porcentaje_iva']);
            self::agregar($doc, $imp, 'tarifa', self::money($d['tarifa_iva']));
            self::agregar($doc, $imp, 'baseImponible', self::money($d['base_imponible_iva']));
            self::agregar($doc, $imp, 'valor', self::money($d['valor_iva']));
        }

        return $doc;
    }

    private static function money($valor): string
    {
        return number_format((float)$valor, 2, '.', '');
    }

    private static function agregar(DOMDocument $doc, DOMElement $padre, string $nombre, $valor): void
    {
        $el = $doc->createElement($nombre);
        $el->appendChild($doc->createTextNode((string)$valor));
        $padre->appendChild($el);
    }
}
