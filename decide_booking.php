<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

$id = (int)($_POST['id'] ?? 0);
$status = $_POST['status'] ?? '';
$note = $_POST['note'] ?? '';

$stmt = $conn->prepare("UPDATE bookings SET status = ?, note = ? WHERE id = ?");
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Query Error: " . $conn->error]);
    exit;
}

$stmt->bind_param("ssi", $status, $note, $id);

if ($stmt->execute()) echo json_encode(["status" => "success"]);
else echo json_encode(["status" => "error", "message" => "Gagal memperbarui status."]);

$stmt->close();
$conn->close();
?>