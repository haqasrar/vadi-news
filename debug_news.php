<?php
// debug_news.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Debug: Checking News Data</h1>";

// Try to include config
$configPath = 'admin/config.php';
if (!file_exists($configPath)) {
    die("❌ Error: admin/config.php not found at $configPath");
}
include $configPath;

echo "✅ Config loaded.<br>";

// Check Connection
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}
echo "✅ Database connected (Port: 3307, DB: vadi_kashmir).<br>";

// Query News
$sql = "SELECT id, title, type, category FROM news ORDER BY id DESC LIMIT 5";
$result = $conn->query($sql);

if ($result) {
    if ($result->num_rows > 0) {
        echo "✅ Found " . $result->num_rows . " news items:<br><ul>";
        while($row = $result->fetch_assoc()) {
            echo "<li>ID: " . $row['id'] . " | Title: " . $row['title'] . " | Type: " . $row['type'] . " | Cat: " . $row['category'] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "⚠️ Connected but NO news items found in 'news' table.<br>";
    }
} else {
    echo "❌ Query failed: " . $conn->error . "<br>";
}

// Check Ticker
$tRes = $conn->query("SELECT * FROM ticker LIMIT 5");
if ($tRes && $tRes->num_rows > 0) {
    echo "✅ Found ticker items.<br>";
} else {
    echo "⚠️ No ticker items found.<br>";
}

$conn->close();
?>
