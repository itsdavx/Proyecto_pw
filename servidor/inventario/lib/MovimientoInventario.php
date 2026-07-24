<?php
/**
 * Registro de movimientos de inventario ajenos a la venta.
 *
 * Las salidas por venta se derivan del detalle de las facturas
 * (factura_detalle) y no se registran aquí, para no duplicar esa
 * información. Esta clase cubre los movimientos que no tienen otro
 * origen: el stock inicial al crear un producto y las variaciones de
 * existencia al editarlo.
 *
 * Los datos del producto se guardan como instantánea (código,
 * descripción y unidad) para que el historial sobreviva a su
 * eliminación, igual que en el detalle de factura.
 */
class MovimientoInventario
{
    const INGRESO = 'INGRESO POR COMPRA';
    const AJUSTE  = 'AJUSTE DE INVENTARIO';

    /**
     * Registra la variación de existencia de un producto. Si el stock no
     * cambió no registra nada. Un aumento se registra como ingreso por
     * compra (con su proveedor, si se indicó); una disminución manual,
     * como ajuste de inventario (el proveedor no aplica y se descarta).
     *
     * @param array   $producto  Fila con id_producto, codigo_principal, descripcion y unidad (abreviatura).
     * @param ?string $proveedor Nombre libre del proveedor; solo se guarda cuando el movimiento es un ingreso.
     */
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

    /** Abreviatura de la unidad de medida de un producto. */
    public static function unidadDe(PDO $db, int $idUnidad): ?string
    {
        $stmt = $db->prepare("SELECT abreviatura FROM unidades_medida WHERE id_unidad = ?");
        $stmt->execute([$idUnidad]);
        $r = $stmt->fetchColumn();
        return $r === false ? null : $r;
    }
}
