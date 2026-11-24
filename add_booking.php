<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

$nim = $_POST['nim'] ?? '';
$room = $_POST['room'] ?? '';
$date = $_POST['date'] ?? '';
$slot = $_POST['slot'] ?? '';
$purpose = $_POST['purpose'] ?? '';
$participants = (int)($_POST['participants'] ?? 1);
$extraFac = $_POST['extraFac'] ?? '';
$extraReason = $_POST['extraReason'] ?? '';

$stmt = $conn->prepare("INSERT INTO bookings (nim, room_id, date, slot, purpose, participants, extra_fac, extra_reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Query Error: " . $conn->error]);
    exit;
}

$stmt->bind_param("sssssiss", $nim, $room, $date, $slot, $purpose, $participants, $extraFac, $extraReason);

if ($stmt->execute()) echo json_encode(["status" => "success"]);
else echo json_encode(["status" => "error", "message" => "Gagal menyimpan pengajuan."]);

$stmt->close();
$conn->close();
?>