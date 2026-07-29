<?php
// Catálogos del SRI
class Catalogos
{
    public const TIPO_COMPROBANTE = [
        '01' => 'FACTURA',
        '03' => 'LIQUIDACIÓN DE COMPRA DE BIENES Y PRESTACIÓN DE SERVICIOS',
        '04' => 'NOTA DE CRÉDITO',
        '05' => 'NOTA DE DÉBITO',
        '06' => 'GUÍA DE REMISIÓN',
        '07' => 'COMPROBANTE DE RETENCIÓN',
    ];

    public const TIPO_IDENTIFICACION = [
        '04' => 'RUC',
        '05' => 'CÉDULA',
        '06' => 'PASAPORTE',
        '07' => 'CONSUMIDOR FINAL',
        '08' => 'IDENTIFICACIÓN DEL EXTERIOR',
    ];

    public const IVA = [
        '0' => ['nombre' => '0%',                    'tarifa' => 0.00],
        '4' => ['nombre' => '15%',                    'tarifa' => 15.00],
        '6' => ['nombre' => 'No objeto de impuesto',  'tarifa' => 0.00],
        '7' => ['nombre' => 'Exento de IVA',           'tarifa' => 0.00],
    ];

    public const IMPUESTO_ESPECIAL = [
        '3' => 'ICE — Impuesto a los Consumos Especiales',
        '5' => 'IRBPNR — Impuesto Redimible a las Botellas Plásticas No Retornables',
    ];

    public const FORMA_PAGO = [
        '01' => 'Sin utilización del sistema financiero',
        '15' => 'Compensación de deudas',
        '16' => 'Tarjeta de débito',
        '17' => 'Dinero electrónico',
        '18' => 'Tarjeta prepago',
        '19' => 'Tarjeta de crédito',
        '20' => 'Otros con utilización del sistema financiero',
        '21' => 'Endoso de títulos',
    ];

    public const CONSUMIDOR_FINAL_ID = '9999999999999';

    public const LONGITUD_IDENTIFICACION = [
        '04' => 13,
        '05' => 10,
        '07' => 13,
    ];

    // Tarifa por código IVA
    public static function tarifaIva(string $codigo): float
    {
        return self::IVA[$codigo]['tarifa'] ?? 0.00;
    }
}
