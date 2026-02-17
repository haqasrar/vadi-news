<?php
session_start();
if(isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true){
    header("Location: dashboard.php");
    exit;
}

$error = "";

if($_SERVER["REQUEST_METHOD"] == "POST") {
    include 'config.php';
    
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Simple check for the default credential requested by user "vadiadmin", "developer123"
    // In a real scenario, fetch hash from DB and use password_verify()
    if($username === "vadiadmin" && $password === "developer123") {
        $_SESSION['admin_logged_in'] = true;
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Invalid Credentials!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Vadi E Kashmir</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #111827; height: 100vh; display: flex; justify-content: center; align-items: center; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 12px; width: 100%; max-width: 400px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .login-logo { width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 3px solid #b91c1c; margin-bottom: 20px; }
        h1 { color: #b91c1c; margin: 0 0 20px 0; text-transform: uppercase; font-size: 1.5rem; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #b91c1c; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; }
        .error { color: red; margin-top: 15px; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="login-box">
        <img src="../images/Logo.png" class="login-logo" alt="Logo">
        <h1>Admin Access</h1>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Secure Login</button>
        </form>
        <?php if($error) echo "<div class='error'>$error</div>"; ?>
    </div>
</body>
</html>
