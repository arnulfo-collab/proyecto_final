<?php
/*
 * logout.php
 * Cierra la sesión del usuario y lo regresa al login.
 */

session_start();

// Eliminar todas las variables de sesión
session_unset();

// Destruir la sesión
session_destroy();

// Respuesta en JSON para frontend con fetch()
echo json_encode([
    "status" => "ok",
    "mensaje" => "Sesión cerrada correctamente"
]);
