<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

$action = $_POST['action'] ?? '';

if ($action === 'delete') {
    $id = $_POST['id'] ?? '';
    $stmt = $conn->prepare("DELETE FROM rooms WHERE id = ?");
    if (!$stmt) { echo json_encode(["status" => "error", "message" => "Query Error: " . $conn->error]); exit; }
    $stmt->bind_param("s", $id);
    
    if ($stmt->execute()) echo json_encode(["status" => "success"]);
    else echo json_encode(["status" => "error", "message" => "Gagal menghapus ruangan."]);
    $stmt->close();
} 
else if ($action === 'add' || $action === 'edit') {
    // PERBAIKAN: Gunakan angka acak 5 digit agar tidak melebihi VARCHAR(10)
    $id = $_POST['id'] ?? ('r' . rand(10000, 99999));
    $name = $_POST['name'] ?? '';
    $cap = (int)$_POST['cap'];
    $fac = $_POST['fac'] ?? '';
    $slots = $_POST['slots'] ?? '["08.00–10.00", "11.00–13.00", "14.00–16.00", "17.00–19.00"]';

    if ($action === 'add') {
        $stmt = $conn->prepare("INSERT INTO rooms (id, name, cap, fac, slots) VALUES (?, ?, ?, ?, ?)");
    } else {
        $stmt = $conn->prepare("UPDATE rooms SET name = ?, cap = ?, fac = ?, slots = ? WHERE id = ?");
    }

    if (!$stmt) { echo json_encode(["status" => "error", "message" => "Query Error: " . $conn->error]); exit; }
    
    if ($action === 'add') $stmt->bind_param("ssiss", $id, $name, $cap, $fac, $slots);
    else $stmt->bind_param("sisss", $name, $cap, $fac, $slots, $id);

    if ($stmt->execute()) echo json_encode(["status" => "success"]);
    else echo json_encode(["status" => "error", "message" => "Gagal menyimpan ruangan."]);
    $stmt->close();
}
$conn->close();
?>