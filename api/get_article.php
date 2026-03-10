<?php
// api/get_article.php
// Returns full data for a single article by ID (including base64 image, description, gallery)
header("Content-Type: application/json");
include __DIR__ . '/admin/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "No ID provided"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM news WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(["error" => "Article not found"]);
        exit;
    }

    // Gallery
    $gStmt = $conn->prepare("SELECT image_url FROM news_gallery WHERE news_id = ?");
    $gStmt->execute([$id]);
    $gallery = $gStmt->fetchAll(PDO::FETCH_COLUMN);

    $row['gallery'] = $gallery;
    $row['img']     = $row['main_image'];
    $row['desc']    = $row['description'];
    $row['date']    = $row['created_at'];

    // Don't send back the raw base64 main_image (img alias is enough)
    unset($row['main_image'], $row['description']);

    echo json_encode($row);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
