<?php
// admin/api/delete_news.php
header("Content-Type: application/json");
include 'admin/config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

if(!$id) {
    echo json_encode(["success"=>false]);
    exit;
}

try {
    // Check Type (Passed from dashboard)
    $type = $data['type'] ?? 'standard';

    if ($type === 'breaking') {
        // Delete from Ticker
        $stmt = $conn->prepare("DELETE FROM ticker WHERE id = ?");
        $success = $stmt->execute([$id]);
    } else {
        // Delete from News
        $stmt = $conn->prepare("DELETE FROM news_gallery WHERE news_id = ?");
        $stmt->execute([$id]);

        $stmt2 = $conn->prepare("DELETE FROM news WHERE id = ?");
        $success = $stmt2->execute([$id]);
    }

    echo json_encode(["success"=>$success]);

} catch(PDOException $e) {
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}

