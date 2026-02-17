<?php
// admin/api/toggle_trending.php
header("Content-Type: application/json");
include '../admin/config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];
$status = $data['status'] ? 1 : 0;

if(!$id) {
    echo json_encode(["success"=>false]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE news SET is_trending = ? WHERE id = ?");
    $success = $stmt->execute([$status, $id]);
    echo json_encode(["success"=>$success]);
} catch(PDOException $e) {
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}

