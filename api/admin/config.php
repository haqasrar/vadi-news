<?php
// admin/config.php

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "vadi_kashmir";
$port = 3307;

$conn = null;

try {
    // Check for Vercel Environment (Neon/Supabase/Vercel Postgres)
    $db_url = getenv('POSTGRES_URL') ?: getenv('DATABASE_URL');
    
    if ($db_url) {
        // Parse Vercel Postgres URL to PDO DSN
        $db_parts = parse_url($db_url);
        
        $host = $db_parts['host'] ?? '';
        $port = $db_parts['port'] ?? 5432;
        $user = $db_parts['user'] ?? '';
        $pass = $db_parts['pass'] ?? '';
        $path = $db_parts['path'] ?? '';
        $dbnamestr = ltrim($path, "/");

        $dsn = "pgsql:" . sprintf(
            "host=%s;port=%s;user=%s;password=%s;dbname=%s;sslmode=require",
            $host,
            $port,
            $user,
            $pass,
            $dbnamestr
        );
        $conn = new PDO($dsn);
    } else {
        // Local XAMPP (Development)
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        $conn = new PDO($dsn, $user, $pass);
    }

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (\Throwable $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit();
}
// PDO connection established as $conn

