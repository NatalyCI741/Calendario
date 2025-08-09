<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$_SESSION = array();
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Sesión cerrada correctamente"
]);
?>