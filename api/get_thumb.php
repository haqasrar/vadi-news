<?php
// api/get_thumb.php
// Returns the main_image (base64) for a single article.
// Used as the img src so the list payload stays small.
include __DIR__ . '/admin/config.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT main_image FROM news WHERE id = ? LIMIT 1");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || !$row['main_image']) {
        // Redirect to a placeholder image
        header("Location: /images/placeholder.jpg");
        exit;
    }

    // Detect image type from base64 header
    $b64 = $row['main_image'];

    // If already a URL (not base64), redirect
    if (strpos($b64, 'http') === 0 || strpos($b64, '/') === 0) {
        header("Location: " . $b64);
        exit;
    }

    // Strip the data URI prefix if present: "data:image/jpeg;base64,..."
    if (preg_match('/^data:(image\/\w+);base64,/', $b64, $matches)) {
        $mime = $matches[1];
        $b64 = preg_replace('/^data:image\/\w+;base64,/', '', $b64);
    } else {
        $mime = 'image/jpeg'; // default
    }

    header("Content-Type: $mime");
    header("Cache-Control: public, max-age=86400");
    echo base64_decode($b64);

} catch (PDOException $e) {
    http_response_code(500);
    exit;
}
