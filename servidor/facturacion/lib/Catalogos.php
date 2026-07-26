<?php
// Catálogos oficiales del SRI
class Catalogos
{
    // Tipos de comprobante (codDoc)
    public const TIPO_COMPROBANTE = [
        '01' => 'FACTURA',
        '03' => 'LIQUIDACIÓN DE COMPRA DE BIENES Y PRESTACIÓN DE SERVICIOS',
        '04' => 'NOTA DE CRÉDITO',
        '05' => 'NOTA DE DÉBITO',
        '06' => 'GUÍA DE REMISIÓN',
        '07' => 'COMPROBANTE DE RETENCIÓN',
    ];

    // Tipo de identificación
    public const TIPO_IDENTIFICACION = [
        '04' => 'RUC',
        '05' => 'CÉDULA',
        '06' => 'PASAPORTE',
        '07' => 'CONSUMIDOR FINAL',
        '08' => 'IDENTIFICACIÓN DEL EXTERIOR',
    ];

    // Códigos de IVA vigentes
    public const IVA = [
        '0' => ['nombre' => '0%',                    'tarifa' => 0.00],
        '4' => ['nombre' => '15%',                    'tarifa' => 15.00],
        '6' => ['nombre' => 'No objeto de impuesto',  'tarifa' => 0.00],
        '7' => ['nombre' => 'Exento de IVA',           'tarifa' => 0.00],
    ];

    // Impuestos especiales (informativo)
    public const IMPUESTO_ESPECIAL = [
        '3' => 'ICE — Impuesto a los Consumos Especiales',
        '5' => 'IRBPNR — Impuesto Redimible a las Botellas Plásticas No Retornables',
    ];

    // Formas de pago
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

    // Longitud según tipo de ID
    public const LONGITUD_IDENTIFICACION = [
        '04' => 13,
        '05' => 10,
        '07' => 13,
    ];

    public static function tarifaIva(string $codigo): float
    {
        return self::IVA[$codigo]['tarifa'] ?? 0.00;
    }
}
