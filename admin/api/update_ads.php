<?php
// admin/api/update_ads.php
header("Content-Type: application/json");
include '../config.php';

$data = json_decode(file_get_contents("php://input"), true);
$type = $data['type']; // 'manual' or 'google' (though simple setup mostly manual)

if($type == 'manual') {
    $img = $data['img']; // Base64
    $bio = $conn->real_escape_string($data['bio']);
    $link = $conn->real_escape_string($data['link']);
    
    // Save Image
    $imagePath = "";
    if($img) {
        $imgClean = str_replace('data:image/jpeg;base64,', '', $img);
        $imgClean = str_replace(' ', '+', $imgClean);
        $dataImg = base64_decode($imgClean);
        $fileName = 'ad_' . time() . '.jpg';
        $filePath = '../../uploads/' . $fileName;
        
        if(file_put_contents($filePath, $dataImg)) {
            $imagePath = 'uploads/' . $fileName;
        }
    }
    
    $sql = "INSERT INTO ads (type, content, bio, link) VALUES ('manual', '$imagePath', '$bio', '$link')";
    $conn->query($sql);
    echo json_encode(["success"=>true]);
} else {
    // Google Ad placeholder logic
    echo json_encode(["success"=>true]); 
}

$conn->close();
?>
