<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include 'config.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $nombre_evento = $data->nombre_evento;
    $fecha_hora = $data->fecha_hora;
    $descripcion = $data->descripcion;
    $ubicacion = $data->ubicacion;
    $usuario_id = $data->usuario_id;

    // Validar que la fecha y hora no sean en el pasado
    if (strtotime($fecha_hora) < time()) {
        echo json_encode([
            "error" => true,
            "mensaje" => "No se puede registrar un evento en una fecha pasada.",
            "tipo" => "fecha_pasada"
        ]);
        exit;
    }

    // Verificar si ya existe un evento en la misma fecha y hora
    $check_sql = "SELECT * FROM eventos WHERE fecha_hora = '$fecha_hora'";
    $check_result = $conn->query($check_sql);
    
    if ($check_result->num_rows > 0) {
        echo json_encode([
            "error" => true,
            "mensaje" => "Ya existe un evento programado para esta fecha y hora.",
            "tipo" => "evento_duplicado"
        ]);
        exit;
    }

    $sql = "INSERT INTO eventos (nombre_evento, fecha_hora, descripcion, ubicacion, usuario_id) 
            VALUES ('$nombre_evento', '$fecha_hora', '$descripcion', '$ubicacion', '$usuario_id')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            "error" => false,
            "mensaje" => "Evento agregado exitosamente"
        ]);
    } else {
        echo json_encode([
            "error" => true,
            "mensaje" => "Error al guardar el evento: " . $conn->error,
            "tipo" => "error_db"
        ]);
    }
}

if ($method === 'GET') {
    $sql = "SELECT * FROM eventos ORDER BY fecha_hora ASC";
    $result = $conn->query($sql);
    $eventos = [];

    while ($row = $result->fetch_assoc()) {
        $eventos[] = $row;
    }

    echo json_encode($eventos);
}

if ($method === 'DELETE') {
    $id = $_GET['id'];
    $sql = "DELETE FROM eventos WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            "error" => false,
            "mensaje" => "Evento eliminado exitosamente"
        ]);
    } else {
        echo json_encode([
            "error" => true,
            "mensaje" => "Error al eliminar el evento: " . $conn->error,
            "tipo" => "error_db"
        ]);
    }
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    $id = $data->id;
    $nombre_evento = $data->nombre_evento;
    $fecha_hora = $data->fecha_hora;
    $descripcion = $data->descripcion;
    $ubicacion = $data->ubicacion;

    // Validar que la fecha y hora no sean en el pasado
    if (strtotime($fecha_hora) < time()) {
        echo json_encode([
            "error" => true,
            "mensaje" => "No se puede actualizar a una fecha pasada.",
            "tipo" => "fecha_pasada"
        ]);
        exit;
    }

    // Verificar si ya existe otro evento en la misma fecha y hora (excluyendo el evento actual)
    $check_sql = "SELECT * FROM eventos WHERE fecha_hora = '$fecha_hora' AND id != $id";
    $check_result = $conn->query($check_sql);
    
    if ($check_result->num_rows > 0) {
        echo json_encode([
            "error" => true,
            "mensaje" => "Ya existe otro evento programado para esta fecha y hora.",
            "tipo" => "evento_duplicado"
        ]);
        exit;
    }

    $sql = "UPDATE eventos SET nombre_evento='$nombre_evento', fecha_hora='$fecha_hora', descripcion='$descripcion', ubicacion='$ubicacion' WHERE id=$id";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            "error" => false,
            "mensaje" => "Evento actualizado exitosamente"
        ]);
    } else {
        echo json_encode([
            "error" => true,
            "mensaje" => "Error al actualizar el evento: " . $conn->error,
            "tipo" => "error_db"
        ]);
    }
}

$conn->close();
?>