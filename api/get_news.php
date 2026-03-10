<?php
// api/get_news.php
header("Content-Type: application/json");
include __DIR__ . '/admin/config.php';

try {
    // Only fetch lightweight metadata — NO full base64 main_image blob
    // This prevents FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE on Vercel
    // Columns in schema: id, title, author, category, type, video_url, is_trending, created_at, description
    // We grab a short excerpt of description as 'summary' (first 150 chars)
    $sql = "SELECT id, title, author, category, type, video_url, is_trending, created_at,
                   SUBSTRING(description, 1, 150) AS summary
            FROM news ORDER BY id DESC LIMIT 50";
    $stmt = $conn->query($sql);
    $news = [];

    if ($stmt) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (!isset($row['type']) || !$row['type']) $row['type'] = 'standard';

            // Thumbnail served via separate endpoint — avoid embedding base64 in list
            $row['img']        = '/api/get_thumb.php?id=' . $row['id'];
            $row['date']       = $row['created_at'];
            $row['isTrending'] = (bool)$row['is_trending'];

            $news[] = $row;
        }
    }

    // Fetch Ticker (Breaking News) — text-only, tiny payload
    $tStmt = $conn->query("SELECT id, title, created_at FROM ticker ORDER BY id DESC LIMIT 5");
    if ($tStmt) {
        while ($tRow = $tStmt->fetch(PDO::FETCH_ASSOC)) {
            $tRow['type'] = 'breaking';
            $tRow['date'] = $tRow['created_at'];
            $news[] = $tRow;
        }
    }

    echo json_encode($news);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Error: " . $e->getMessage()]);
}
