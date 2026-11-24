<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

$query = "SELECT b.id, b.nim, u.nama as name, b.room_id as room, b.date, b.slot, b.slot as slotTime, b.purpose, b.extra_fac as extraFac, b.extra_reason as extraReason, b.participants, b.status, b.note, b.submitted_at as submittedAt 
          FROM bookings b JOIN users u ON b.nim = u.nim 
          ORDER BY b.id DESC";

$result = $conn->query($query);
$bookings = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id']; // <-- INI BARIS PENYELAMATNYA
        $row['participants'] = (int)$row['participants'];
        $bookings[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $bookings]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data: " . $conn->error]);
}
$conn->close();
?>