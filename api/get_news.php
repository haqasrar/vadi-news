<?php
// admin/api/get_news.php
header("Content-Type: application/json");
include '../admin/config.php';

// Fetch News
try {
    $sql = "SELECT * FROM news ORDER BY id DESC";
    $stmt = $conn->query($sql);
    $news = [];

    if ($stmt) {
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $nid = $row['id'];
            
            // Gallery
            $gStmt = $conn->prepare("SELECT image_url FROM news_gallery WHERE news_id = ?");
            $gStmt->execute([$nid]);
            $gallery = $gStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $row['gallery'] = $gallery;

            // Ensure type is consistent
            if(!isset($row['type']) || !$row['type']) $row['type'] = 'standard';

            // Map fields for frontend compatibility
            $row['img'] = $row['main_image']; 
            $row['desc'] = $row['description'];

            $news[] = $row;
        }
    }

    // Fetch Ticker (Breaking News)
    $tStmt = $conn->query("SELECT * FROM ticker ORDER BY id DESC LIMIT 5");
    if ($tStmt) {
        while($tRow = $tStmt->fetch(PDO::FETCH_ASSOC)) {
            $tRow['type'] = 'breaking'; // Force type for frontend filter
            $news[] = $tRow;
        }
    }

    echo json_encode($news);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
