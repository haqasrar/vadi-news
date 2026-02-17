<?php
// admin/api/post_ticker.php
header("Content-Type: application/json");
include __DIR__ . '/admin/config.php';

$data = json_decode(file_get_contents("php://input"), true);

$title = $data['title'];
$link = $data['link'];

try {
    $stmt = $conn->prepare("INSERT INTO ticker (title, link) VALUES (?, ?)");
    $success = $stmt->execute([$title, $link]);
    if ($success) {
        echo json_encode(["success" => true, "message" => "Ticker added"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database insert failed"]);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
