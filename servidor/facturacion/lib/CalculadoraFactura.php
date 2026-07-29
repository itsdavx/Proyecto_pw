<?php
// Cálculos de la factura
require_once __DIR__ . '/Catalogos.php';

class CalculadoraFactura
{
    // Subtotal e IVA
    public static function calcularLinea(float $cantidad, float $precioUnitario, float $descuento, string $codigoIva): array
    {
        $subtotal = round(($cantidad * $precioUnitario) - $descuento, 2);
        $tarifa   = Catalogos::tarifaIva($codigoIva);
        $valorIva = round($subtotal * ($tarifa / 100), 2);

        return [
            'precio_total_sin_impuesto' => $subtotal,
            'codigo_porcentaje_iva'     => $codigoIva,
            'tarifa_iva'                => $tarifa,
            'base_imponible_iva'        => $subtotal,
            'valor_iva'                 => $valorIva,
        ];
    }

    // Agrupa IVA y suma
    public static function calcularTotales(array $lineas): array
    {
        $totalSinImpuestos = 0.00;
        $totalDescuento    = 0.00;
        $porIva            = [];

        foreach ($lineas as $l) {
            $totalSinImpuestos += $l['precio_total_sin_impuesto'];
            $totalDescuento    += $l['descuento'] ?? 0;

            $cod = $l['codigo_porcentaje_iva'];
            if (!isset($porIva[$cod])) $porIva[$cod] = ['base' => 0.00, 'valor' => 0.00];
            $porIva[$cod]['base']  += $l['base_imponible_iva'];
            $porIva[$cod]['valor'] += $l['valor_iva'];
        }

        $totalIva = array_sum(array_column($porIva, 'valor'));

        return [
            'total_sin_impuestos' => round($totalSinImpuestos, 2),
            'total_descuento'     => round($totalDescuento, 2),
            'total_iva'           => round($totalIva, 2),
            'importe_total'       => round($totalSinImpuestos + $totalIva, 2),
            'por_iva'             => $porIva,
        ];
    }
}
