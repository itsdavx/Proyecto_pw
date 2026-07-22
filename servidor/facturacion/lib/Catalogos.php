<?php
/**
 * Catálogos oficiales del SRI utilizados por el módulo de Facturación
 * Electrónica (Ficha Técnica de Comprobantes Electrónicos v2.32),
 * acotados a los códigos vigentes necesarios para FACTURAS (codDoc 01).
 * No se listan códigos históricos fuera de uso.
 */
class Catalogos
{
    // Tabla 3 — Tipos de comprobantes electrónicos (codDoc)
    public const TIPO_COMPROBANTE = [
        '01' => 'FACTURA',
        '03' => 'LIQUIDACIÓN DE COMPRA DE BIENES Y PRESTACIÓN DE SERVICIOS',
        '04' => 'NOTA DE CRÉDITO',
        '05' => 'NOTA DE DÉBITO',
        '06' => 'GUÍA DE REMISIÓN',
        '07' => 'COMPROBANTE DE RETENCIÓN',
    ];

    // Tabla 5 — Tipo de identificación del comprador
    public const TIPO_IDENTIFICACION = [
        '04' => 'RUC',
        '05' => 'CÉDULA',
        '06' => 'PASAPORTE',
        '07' => 'CONSUMIDOR FINAL',
        '08' => 'IDENTIFICACIÓN DEL EXTERIOR',
    ];

    // Códigos de IVA vigentes (codigoPorcentaje) — tarifa en %
    public const IVA = [
        '0' => ['nombre' => '0%',                    'tarifa' => 0.00],
        '4' => ['nombre' => '15%',                    'tarifa' => 15.00],
        '6' => ['nombre' => 'No objeto de impuesto',  'tarifa' => 0.00],
        '7' => ['nombre' => 'Exento de IVA',           'tarifa' => 0.00],
    ];

    // Tabla 6 — Formas de pago
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

    // Longitud exacta esperada de la identificación según su tipo
    // (Pasaporte e Identificación del Exterior no tienen longitud fija).
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
