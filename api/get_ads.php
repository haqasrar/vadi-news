<?php
// admin/api/get_ads.php
header("Content-Type: application/json");
include __DIR__ . '/admin/config.php';

// Fetch the latest manual ad (or logic for multiple)
try {
    $stmt = $conn->query("SELECT * FROM ads ORDER BY id DESC LIMIT 1");
    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Map fields to what frontend expects
        echo json_encode([
            "img" => $row['content'],
            "link" => $row['link'],
            "bio" => $row['bio'],
            "type" => $row['type']
        ]);
    } else {
        echo json_encode(null);
    }
} catch(PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}


