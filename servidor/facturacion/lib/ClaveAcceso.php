<?php
// Clave de acceso SRI
class ClaveAcceso
{
    // 48 dígitos más verificador
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
            '01' .
            $ruc .
            $ambiente .
            $serie .
            str_pad($secuencial, 9, '0', STR_PAD_LEFT) .
            str_pad($codigoNumerico, 8, '0', STR_PAD_LEFT) .
            $tipoEmision;

        return $clave48 . self::digitoVerificadorModulo11($clave48);
    }

    // Dígito verificador módulo 11
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

    // Código numérico aleatorio
    public static function generarCodigoNumerico(): string
    {
        return str_pad((string)random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
    }
}
