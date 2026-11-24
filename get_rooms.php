<?php
// get_rooms.php
header("Content-Type: application/json");
require 'koneksi.php';

$result = $conn->query("SELECT * FROM rooms");
$rooms = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Kolom slots di database berformat teks JSON, kita ubah jadi Array asli
        $row['slots'] = json_decode($row['slots']); 
        // Pastikan kapasitas terbaca sebagai angka
        $row['cap'] = (int)$row['cap']; 
        
        $rooms[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $rooms]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data ruangan."]);
}

$conn->close();
?>