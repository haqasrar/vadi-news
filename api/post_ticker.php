<?php
// admin/api/post_ticker.php
header("Content-Type: application/json");
include 'admin/config.php';

$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'];
$link = $data['link'];

try {
    $stmt = $conn->prepare("INSERT INTO ticker (title, link) VALUES (?, ?)");
    $success = $stmt->execute([$title, $link]);
    echo json_encode(["success"=>$success]);
} catch(PDOException $e) {
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}

