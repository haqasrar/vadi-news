<?php
// admin/api/post_news.php
header("Content-Type: application/json");
include '../admin/config.php';

// Decode JSON
$data = json_decode(file_get_contents("php://input"), true);

if(!$data) {
    echo json_encode(["success"=>false, "message"=>"No data received"]);
    exit;
}

try {
    // Prepare Data
    $title = $data['title'];
    $author = $data['author'];
    $desc = $data['desc'];
    $type = $data['type'];
    $category = $data['category'];
    $video = $data['video'];
    $main_image_base64 = $data['main_image']; // Already Base64 from frontend

    // Insert News (Store Image Base64 directly)
    $stmt = $conn->prepare("INSERT INTO news (title, author, description, category, type, main_image, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$title, $author, $desc, $category, $type, $main_image_base64, $video]);
    
    $news_id = $conn->lastInsertId();
    
    // Handle Gallery (Store Base64 directly)
    if(isset($data['gallery']) && is_array($data['gallery'])) {
        $gStmt = $conn->prepare("INSERT INTO news_gallery (news_id, image_url) VALUES (?, ?)");
        foreach($data['gallery'] as $gImgBase64) {
            $gStmt->execute([$news_id, $gImgBase64]);
        }
    }
    
    echo json_encode(["success"=>true, "id"=>$news_id]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "message" => "Database Error: " . $e->getMessage()]);
}


