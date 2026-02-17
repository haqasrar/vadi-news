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
        $dsn = "pgsql:" . sprintf(
            "host=%s;port=%s;user=%s;password=%s;dbname=%s;sslmode=require",
            $db_parts['host'],
            $db_parts['port'] ?? 5432,
            $db_parts['user'],
            $db_parts['pass'],
            ltrim($db_parts['path'], "/")
        );
        $conn = new PDO($dsn);
    } else {
        // Local XAMPP (Development)
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        $conn = new PDO($dsn, $user, $pass);
    }

    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
// PDO connection established as $conn

