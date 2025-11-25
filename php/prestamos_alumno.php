<?php
// TEMPORAL: mostrar errores para debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion.php';

// Verificar que exista conexión mysqli ($conexion) creada en conexion.php
if (!isset($conexion) || !($conexion instanceof mysqli)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se estableció conexión con la base de datos'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Consulta: traer préstamos autorizados, pendientes y en uso (NO rechazados ni finalizados)
    $sql = "SELECT 
                p.id_prestamo,
                p.id_usuario,
                p.id_laboratorio,
                p.fecha_prestamo,
                p.fecha_devolucion,
                p.estado,
                p.fecha_solicitud,
                p.tipo_prestamo,
                p.nombre_grupo,
                p.descripcion_clase,
                p.numero_alumnos,
                p.motivo_individual,
                u.nombre AS nombre_maestro,
                u.correo AS correo_maestro,
                l.nombre AS nombre_laboratorio,
                l.ubicacion AS ubicacion_laboratorio
            FROM prestamos p
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN laboratorios l ON p.id_laboratorio = l.id_laboratorio
            WHERE p.estado IN ('autorizado', 'pendiente', 'en_uso')";

    // Filtro opcional adicional: solo préstamos vigentes (fecha >= hoy)
    if (isset($_GET['vigentes']) && $_GET['vigentes'] == '1') {
        $sql .= " AND DATE(p.fecha_prestamo) >= CURDATE()";
    }

    $sql .= " ORDER BY p.fecha_prestamo DESC";

    $result = $conexion->query($sql);
    if ($result === false) {
        throw new Exception('Error en consulta SQL: ' . $conexion->error);
    }

    $prestamos = $result->fetch_all(MYSQLI_ASSOC);
    $result->free();

    echo json_encode(['status' => 'ok', 'prestamos' => $prestamos], JSON_UNESCAPED_UNICODE);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error interno del servidor',
        'detail' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>