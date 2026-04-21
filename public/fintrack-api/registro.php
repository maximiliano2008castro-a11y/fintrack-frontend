<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = ""; 
$db = "fintrack_db"; 

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Conexión fallida: " . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"));

if(isset($data->correo) && isset($data->nombre) && isset($data->password)) {
    $nombre = $conn->real_escape_string($data->nombre);
    $correo = $conn->real_escape_string($data->correo);
    $password = password_hash($data->password, PASSWORD_BCRYPT); // Encriptamos la contraseña
    $pin = isset($data->pin) ? $conn->real_escape_string($data->pin) : '';

    // Verificamos si el correo ya existe
    $checkEmail = $conn->query("SELECT id FROM usuarios WHERE correo = '$correo'");
    if($checkEmail->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Este correo ya está registrado."]);
        exit;
    }

    $sql = "INSERT INTO usuarios (nombre, correo, password, pin) VALUES ('$nombre', '$correo', '$password', '$pin')";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "¡Usuario registrado en MySQL!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al guardar: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Faltan datos obligatorios (nombre, correo, password)"]);
}

$conn->close();
?>