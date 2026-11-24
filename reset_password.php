<?php
// reset_password.php
header("Content-Type: application/json");
require 'koneksi.php';

$nim      = trim($_POST['nim'] ?? '');
$email    = trim($_POST['email'] ?? '');
$new_pass = $_POST['new_password'] ?? '';

if (empty($nim) || empty($email) || empty($new_pass)) {
    echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi."]);
    exit;
}

// Proteksi ekstra: Akun admin tidak boleh di-reset lewat form publik
if (strtolower($nim) === 'admin') {
    echo json_encode(["status" => "error", "message" => "Akun administrator tidak dapat direset melalui halaman ini."]);
    exit;
}

// Cocokkan NIM dan Email mahasiswa di database
$cek = $conn->prepare("SELECT nim, nama FROM users WHERE nim = ? AND email = ? AND role = 'mhs'");
$cek->bind_param("ss", $nim, $email);
$cek->execute();
$res = $cek->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Kombinasi NIM dan Email tidak ditemukan."]);
    exit;
}
$cek->close();

// Update kata sandi baru ke database
$stmt = $conn->prepare("UPDATE users SET password = ? WHERE nim = ? AND email = ?");
$stmt->bind_param("sss", $new_pass, $nim, $email);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Kata sandi berhasil diperbarui! Silakan login."]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal memperbarui kata sandi."]);
}

$stmt->close();
$conn->close();
?>