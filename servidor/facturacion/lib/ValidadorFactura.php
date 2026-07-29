<?php
// Valida XML contra XSD
class ValidadorFactura
{
    // Devuelve errores del esquema
    public static function validar(DOMDocument $doc): array
    {
        libxml_use_internal_errors(true);
        libxml_clear_errors();

        $ok = $doc->schemaValidate(__DIR__ . '/factura_v1_1_0.xsd');

        $errores = [];
        if (!$ok) {
            foreach (libxml_get_errors() as $e) {
                $errores[] = trim($e->message) . " (línea {$e->line})";
            }
        }
        libxml_clear_errors();

        return $errores;
    }
}
