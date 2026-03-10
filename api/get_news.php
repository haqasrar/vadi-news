<?php
// api/get_news.php
header("Content-Type: application/json");
include __DIR__ . '/admin/config.php';

try {
    // Only fetch lightweight metadata — NO base64 images, NO full description
    // This prevents FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE on Vercel
    $sql = "SELECT id, title, author, category, type, summary, video_url, created_at, is_trending
            FROM news ORDER BY id DESC LIMIT 50";
    $stmt = $conn->query($sql);
    $news = [];

    if ($stmt) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Ensure type is consistent
            if (!isset($row['type']) || !$row['type']) $row['type'] = 'standard';

            // Provide a thumbnail URL via separate endpoint instead of embedding base64
            $row['img'] = '/api/get_thumb.php?id=' . $row['id'];
            $row['date'] = $row['created_at'];
            $row['isTrending'] = (bool)$row['is_trending'];

            $news[] = $row;
        }
    }

    // Fetch Ticker (Breaking News) - these are small text-only rows
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
