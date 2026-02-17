<?php
// admin/api/delete_news.php
header("Content-Type: application/json");
include '../config.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'];

if(!$id) {
    echo json_encode(["success"=>false]);
    exit;
}

try {
    // Delete Record (Cascade deletes gallery via foreign key if set, or manual delete)
    // Even if images are base64 in DB, we just delete the rows.
    
    $stmt = $conn->prepare("DELETE FROM news_gallery WHERE news_id = ?");
    $stmt->execute([$id]);

    $stmt2 = $conn->prepare("DELETE FROM news WHERE id = ?");
    $success = $stmt2->execute([$id]);

    echo json_encode(["success"=>$success]);

} catch(PDOException $e) {
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}

