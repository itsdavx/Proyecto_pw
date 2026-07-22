<?php
/**
 * Generación de la Clave de Acceso (49 dígitos) y su dígito verificador
 * módulo 11, según el algoritmo oficial del SRI. Sin dependencias de
 * HTTP/BD: recibe todos los datos como parámetros.
 *
 * Estructura de los 48 dígitos previos al verificador:
 *   fecha emisión (8) + codDoc (2) + RUC (13) + ambiente (1) +
 *   establecimiento+ptoEmi (6) + secuencial (9) + código numérico (8) +
 *   tipo emisión (1) = 48
 */
class ClaveAcceso
{
    public static function generar(
        string $fechaEmision,
        string $ruc,
        string $ambiente,
        string $establecimiento,
        string $puntoEmision,
        string $secuencial,
        string $codigoNumerico,
        string $tipoEmision = '1'
    ): string {
        $fecha = date('dmY', strtotime($fechaEmision));
        $serie = $establecimiento . $puntoEmision;

        $clave48 =
            $fecha .
            '01' . // codDoc — Factura
            $ruc .
            $ambiente .
            $serie .
            str_pad($secuencial, 9, '0', STR_PAD_LEFT) .
            str_pad($codigoNumerico, 8, '0', STR_PAD_LEFT) .
            $tipoEmision;

        return $clave48 . self::digitoVerificadorModulo11($clave48);
    }

    /** Algoritmo módulo 11 oficial del SRI sobre los 48 dígitos previos. */
    public static function digitoVerificadorModulo11(string $clave48): int
    {
        $factores = [2, 3, 4, 5, 6, 7];
        $suma     = 0;
        $indice   = 0;

        for ($i = strlen($clave48) - 1; $i >= 0; $i--) {
            $suma += (int)$clave48[$i] * $factores[$indice % 6];
            $indice++;
        }

        $verificador = 11 - ($suma % 11);

        if ($verificador == 11) return 0;
        if ($verificador == 10) return 1;
        return $verificador;
    }

    /** Código numérico aleatorio de 8 dígitos para la clave de acceso. */
    public static function generarCodigoNumerico(): string
    {
        return str_pad((string)random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
    }
}
