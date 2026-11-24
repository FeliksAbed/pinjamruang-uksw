<?php
// koneksi.php
$host = "sql107.infinityfree.com";
$user = "if0_43387873";       // Username default XAMPP
$pass = "srawungid123";           // Password default XAMPP (kosong)
$db   = "if0_43387873_reservasiruang"; // Nama database yang tadi kita buat

$conn = new mysqli($host,$user, $pass,$db);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Koneksi gagal: " . $conn->connect_error]));
}
?>