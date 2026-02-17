<?php
setcookie("admin_token", "", time() - 3600, "/", "", true, true);
header("Location: /admin/index.php");
exit;
?>
