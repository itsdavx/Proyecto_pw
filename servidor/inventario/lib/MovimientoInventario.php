<?php
// Registra cambios de stock
class MovimientoInventario
{
    const INGRESO = 'INGRESO POR COMPRA';
    const AJUSTE  = 'AJUSTE DE INVENTARIO';

    // Ingreso o ajuste
    public static function registrar(PDO $db, array $producto, float $stockAnterior, float $stockNuevo, ?int $idUser, ?string $proveedor = null): void
    {
        $delta = round($stockNuevo - $stockAnterior, 6);
        if ($delta == 0.0) { return; }

        $esIngreso = $delta > 0;

        $db->prepare("
            INSERT INTO inventario_movimientos
                (id_producto, codigo_principal, descripcion, unidad, proveedor, tipo, cantidad, stock_anterior, stock_nuevo, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ")->execute([
            $producto['id_producto'],
            $producto['codigo_principal'],
            $producto['descripcion'],
            $producto['unidad'] ?? null,
            $esIngreso ? ($proveedor ?: null) : null,
            $esIngreso ? self::INGRESO : self::AJUSTE,
            abs($delta),
            $stockAnterior,
            $stockNuevo,
            $idUser,
        ]);
    }

    // Abreviatura de la unidad
    public static function unidadDe(PDO $db, int $idUnidad): ?string
    {
        $stmt = $db->prepare("SELECT abreviatura FROM unidades_medida WHERE id_unidad = ?");
        $stmt->execute([$idUnidad]);
        $r = $stmt->fetchColumn();
        return $r === false ? null : $r;
    }
}
