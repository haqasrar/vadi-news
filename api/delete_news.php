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
    // Fallback: if type is missing, check if it's explicitly 'breaking' from some other source, otherwise default to standard
    $type = $data['type'] ?? 'standard';
    
    // Debugging: If category is breaking, treat as breaking type (just in case frontend sends mixed signals)
    if (isset($data['category']) && strtolower($data['category']) === 'breaking') {
        $type = 'breaking';
    }

    if ($type === 'breaking') {
        // Delete from Ticker
        $stmt = $conn->prepare("DELETE FROM ticker WHERE id = ?");
        $success = $stmt->execute([$id]);
        if(!$success) $error = "Ticker delete failed";
    } else {
        // Delete from News
        $stmt = $conn->prepare("DELETE FROM news_gallery WHERE news_id = ?");
        $stmt->execute([$id]);

        $stmt2 = $conn->prepare("DELETE FROM news WHERE id = ?");
        $success = $stmt2->execute([$id]);
        if(!$success) $error = "News delete failed";
    }

    if($success) {
        echo json_encode(["success"=>true]);
    } else {
        echo json_encode(["success"=>false, "error" => $error ?? "Database execution returned false"]);
    }

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "error"=>$e->getMessage()]);
}

