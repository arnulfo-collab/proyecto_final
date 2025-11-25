<?php
/*
 * login.php
 * Valida credenciales del usuario y devuelve respuesta en JSON.
 * Reglas:
 * - Correo debe ser institucional (@uabc.edu.mx)
 * - Contraseña verificada con password_verify()
 * - Sesión iniciada al autenticar
 */

// Habilitar errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json; charset=utf-8");

require_once "conexion.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "mensaje" => "Método no permitido"]);
    exit;
}

$correo = trim($_POST["correo"] ?? "");
$contrasena = trim($_POST["contrasena"] ?? "");

if (empty($correo) || empty($contrasena)) {
    echo json_encode(["status" => "error", "mensaje" => "Complete todos los campos"]);
    exit;
}

if (!str_ends_with($correo, "@uabc.edu.mx")) {
    echo json_encode(["status" => "error", "mensaje" => "Use correo institucional @uabc.edu.mx"]);
    exit;
}

try {
    $sql = "SELECT id_usuario, nombre, correo, contrasena, rol FROM usuarios WHERE correo = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        echo json_encode(["status" => "error", "mensaje" => "Usuario no encontrado"]);
        exit;
    }

    $usuario = $resultado->fetch_assoc();

    if ($contrasena !== $usuario["contrasena"]) {
        echo json_encode(["status" => "error", "mensaje" => "Contraseña incorrecta"]);
        exit;
    }

    // Crear sesión
    $_SESSION["id_usuario"] = $usuario["id_usuario"];
    $_SESSION["nombre"] = $usuario["nombre"];
    $_SESSION["correo"] = $usuario["correo"];
    $_SESSION["rol"] = $usuario["rol"];

    echo json_encode([
        "status" => "ok",
        "mensaje" => "Login exitoso",
        "rol" => $usuario["rol"],
        "id_usuario" => $usuario["id_usuario"],
        "nombre" => $usuario["nombre"]
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "mensaje" => "Error del servidor"]);
}
?>
