<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// USAR LA MISMA CONEXIÓN QUE EL RESTO DEL SISTEMA
require_once 'conexion.php';

try {
    // Verificar que la conexión existe y funciona
    if (!$conexion || $conexion->connect_error) {
        throw new Exception('Error de conexión: ' . ($conexion->connect_error ?? 'Conexión no establecida'));
    }

    // ======================================================
    // 📊 CONSULTAS PARA OBTENER ESTADÍSTICAS
    // ======================================================

    // Total de laboratorios
    $resLab = $conexion->query("SELECT COUNT(*) AS total FROM laboratorios");
    if (!$resLab) {
        throw new Exception('Error consulta laboratorios: ' . $conexion->error);
    }
    $totalLaboratorios = $resLab->fetch_assoc()['total'];

    // Total de usuarios
    $resUsers = $conexion->query("SELECT COUNT(*) AS total FROM usuarios");
    if (!$resUsers) {
        throw new Exception('Error consulta usuarios: ' . $conexion->error);
    }
    $totalUsuarios = $resUsers->fetch_assoc()['total'];

    // Préstamos del mes actual
    $resPrestamosMes = $conexion->query("
        SELECT COUNT(*) AS total 
        FROM prestamos 
        WHERE MONTH(fecha_prestamo) = MONTH(CURRENT_DATE())
        AND YEAR(fecha_prestamo) = YEAR(CURRENT_DATE())
    ");
    $prestamosMes = 0;
    if ($resPrestamosMes) {
        $prestamosMes = $resPrestamosMes->fetch_assoc()['total'];
    }

    // Laboratorios disponibles
    $resDisponibles = $conexion->query("SELECT COUNT(*) AS total FROM laboratorios WHERE estado='disponible'");
    if (!$resDisponibles) {
        throw new Exception('Error consulta laboratorios disponibles: ' . $conexion->error);
    }
    $labsDisponibles = $resDisponibles->fetch_assoc()['total'];

    // ===============================================
    // 📈 GRÁFICA 1 – Estados de Laboratorios
    // ===============================================
    $labEstados = [];
    $resLabEstados = $conexion->query("
        SELECT estado AS estado, COUNT(*) AS cantidad
        FROM laboratorios
        GROUP BY estado
        ORDER BY cantidad DESC
    ");
    
    if ($resLabEstados) {
        while($row = $resLabEstados->fetch_assoc()) {
            // Convertir nombres de estados a formato legible
            $estadoLegible = '';
            switch($row['estado']) {
                case 'disponible':
                    $estadoLegible = 'Disponible';
                    break;
                case 'mantenimiento':
                    $estadoLegible = 'Mantenimiento';
                    break;
                case 'fuera_servicio':
                case 'fuera_de_servicio':
                    $estadoLegible = 'Fuera de servicio';
                    break;
                default:
                    $estadoLegible = ucfirst($row['estado']);
            }
            
            $labEstados[] = [
                'estado' => $estadoLegible,
                'cantidad' => intval($row['cantidad'])
            ];
        }
    }

    // ===============================================
    // 📈 GRÁFICA 2 – Préstamos por MES (últimos 6 meses)
    // ===============================================
    $prestamosMeses = [];
    $resPrestamosMeses = $conexion->query("
        SELECT DATE_FORMAT(fecha_prestamo, '%b %Y') AS mes, COUNT(*) AS cantidad
        FROM prestamos
        WHERE fecha_prestamo >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(fecha_prestamo), MONTH(fecha_prestamo)
        ORDER BY fecha_prestamo ASC
    ");
    
    if ($resPrestamosMeses) {
        while($row = $resPrestamosMeses->fetch_assoc()) {
            $prestamosMeses[] = [
                'mes' => $row['mes'],
                'cantidad' => intval($row['cantidad'])
            ];
        }
    }
    
    // Si no hay datos, crear datos de ejemplo
    if (empty($prestamosMeses)) {
        $prestamosMeses = [
            ['mes' => 'Sep 2024', 'cantidad' => 8],
            ['mes' => 'Oct 2024', 'cantidad' => 12],
            ['mes' => 'Nov 2024', 'cantidad' => intval($prestamosMes)]
        ];
    }

    // ===============================================
    // 📈 GRÁFICA 3 – Usuarios por Rol
    // ===============================================
    $usuariosRol = [];
    $resUsuariosRol = $conexion->query("
        SELECT rol AS rol, COUNT(*) AS cantidad
        FROM usuarios
        GROUP BY rol
        ORDER BY cantidad DESC
    ");
    
    if ($resUsuariosRol) {
        while($row = $resUsuariosRol->fetch_assoc()) {
            $usuariosRol[] = [
                'rol' => ucfirst($row['rol']),
                'cantidad' => intval($row['cantidad'])
            ];
        }
    }

    // ===============================================
    // 📈 GRÁFICA 4 – Laboratorios más populares
    // ===============================================
    $labsPopulares = [];
    $resLabsPopulares = $conexion->query("
        SELECT l.nombre AS laboratorio, COALESCE(COUNT(p.id_laboratorio), 0) AS solicitudes
        FROM laboratorios l
        LEFT JOIN prestamos p ON l.id_laboratorio = p.id_laboratorio
        GROUP BY l.id_laboratorio, l.nombre
        ORDER BY solicitudes DESC
        LIMIT 5
    ");
    
    if ($resLabsPopulares) {
        while($row = $resLabsPopulares->fetch_assoc()) {
            $labsPopulares[] = [
                'laboratorio' => $row['laboratorio'],
                'solicitudes' => intval($row['solicitudes'])
            ];
        }
    }
    
    // Si no hay datos de popularidad, usar los laboratorios con datos simulados
    if (empty($labsPopulares)) {
        $resLabsNombres = $conexion->query("SELECT nombre FROM laboratorios LIMIT 5");
        if ($resLabsNombres) {
            $contador = 25;
            while($row = $resLabsNombres->fetch_assoc()) {
                $labsPopulares[] = [
                    'laboratorio' => $row['nombre'],
                    'solicitudes' => $contador
                ];
                $contador -= 3;
                if ($contador < 5) $contador = 5;
            }
        }
    }

    // ===============================================
    // 📤 RESPUESTA JSON FINAL
    // ===============================================
    echo json_encode([
        "status" => "ok",
        "estadisticas" => [
            "generales" => [
                "total_laboratorios" => intval($totalLaboratorios),
                "total_usuarios" => intval($totalUsuarios),
                "prestamos_mes_actual" => intval($prestamosMes),
                "laboratorios_disponibles" => intval($labsDisponibles)
            ],
            "laboratorios_estados" => $labEstados,
            "prestamos_por_mes" => $prestamosMeses,
            "usuarios_por_rol" => $usuariosRol,
            "laboratorios_populares" => $labsPopulares
        ],
        "debug" => [
            "bd_nombre" => DB_NAME,
            "conexion" => "OK - Puerto " . DB_PORT,
            "total_labs" => $totalLaboratorios,
            "total_users" => $totalUsuarios,
            "prestamos_mes" => $prestamosMes,
            "labs_disponibles" => $labsDisponibles
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error del servidor: " . $e->getMessage(),
        "debug" => [
            "error" => $e->getMessage(),
            "file" => $e->getFile(),
            "line" => $e->getLine(),
            "bd_config" => [
                "host" => DB_HOST ?? 'No definido',
                "port" => DB_PORT ?? 'No definido',
                "user" => DB_USER ?? 'No definido',
                "database" => DB_NAME ?? 'No definido'
            ]
        ]
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>
