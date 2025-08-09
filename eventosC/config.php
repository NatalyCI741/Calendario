<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "eventos";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>
