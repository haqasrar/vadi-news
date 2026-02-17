<?php
// api/share.php
// Purpose: Serve Open Graph meta tags for WhatsApp/Facebook scrapers
// Then redirect user to the actual article in the SPA

include 'admin/config.php';

$id = $_GET['id'] ?? 0;
$news = null;

if($id) {
    try {
        $stmt = $conn->prepare("SELECT title, description, main_image, created_at FROM news WHERE id = ?");
        $stmt->execute([$id]);
        $news = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch(Exception $e) {
        // Silent fail
    }
}

// Defaults
$title = $news ? $news['title'] : "Vadi E Kashmir | Latest News";
$desc = $news ? substr($news['description'], 0, 150) . "..." : "Stay informed with the latest news from the valley.";
$img = $news && !empty($news['main_image']) ? $news['main_image'] : "https://vediekashmir.vercel.app/images/Logo.png";
$url = "https://vediekashmir.vercel.app/news/$id";

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="<?php echo htmlspecialchars($title); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($desc); ?>">
    <meta property="og:image" content="<?php echo $img; ?>">
    <meta property="og:url" content="<?php echo $url; ?>">
    <meta property="og:site_name" content="Vadi E Kashmir">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo htmlspecialchars($title); ?>">
    <meta name="twitter:description" content="<?php echo htmlspecialchars($desc); ?>">
    <meta name="twitter:image" content="<?php echo $img; ?>">

    <title><?php echo htmlspecialchars($title); ?></title>
    
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #f4f4f4; }
        .redir-msg { color: #555; }
    </style>
</head>
<body>
    <p class="redir-msg">Redirecting to article...</p>
    <script>
        // Redirect to main SPA with hash to load article
        // Wait a split second to ensure scrapers might see the tags (though usually they just request HTML)
        setTimeout(() => {
            window.location.href = "https://vediekashmir.vercel.app/#article=<?php echo $id; ?>";
        }, 100);
    </script>
</body>
</html>
