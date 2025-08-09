<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Conexión a la base de datos
$host = "localhost";
$user = "root";
$password = "";
$dbname = "eventos";


$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Conexión fallida: " . $conn->connect_error]);
    exit();
}

// Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);
$nombre = $data['nombre'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$rol = $data['rol'] ?? 'user';

// Validar los datos
if (empty($nombre) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Nombre, correo y contraseña son requeridos"]);
    exit();
}

// Validar el rol
if (!in_array($rol, ['user', 'admin'])) {
    $rol = 'user';
}

// Verificar si el correo ya está registrado
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El correo ya está registrado"]);
    $stmt->close();
    $conn->close();
    exit();
}

// Hashear la contraseña
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insertar el nuevo usuario en la base de datos
$stmt = $conn->prepare("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nombre, $email, $hashed_password, $rol);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Usuario registrado correctamente"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al registrar el usuario"]);
}

$stmt->close();
$conn->close();
?>