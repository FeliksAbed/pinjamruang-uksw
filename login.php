<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

// Menangkap input dari app.js (bisa berisi NIM atau Email)
$username_or_email = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username_or_email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "NIM/Email dan kata sandi harus diisi."]);
    exit;
}

// Cek apakah input cocok dengan kolom 'nim' ATAU 'email'
$stmt = $conn->prepare("SELECT nim, nama, role FROM users WHERE (nim = ? OR email = ?) AND password = ?");
if (!$stmt) {
     echo json_encode(["status" => "error", "message" => "Query Error: " . $conn->error]);
     exit;
}

// Karena ada 3 tanda tanya (?), kita masukkan variabelnya 3 kali (input, input, password)
$stmt->bind_param("sss", $username_or_email, $username_or_email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Jika data cocok, izinkan masuk
    $user = $result->fetch_assoc();
    
    echo json_encode([
        "status" => "success",
        "data" => [
            "u" => $user['nim'], // Tetap kirimkan NIM ke frontend sebagai ID utama
            "role" => $user['role'],
            "name" => $user['nama']
        ]
    ]);
} else {
    // Jika data tidak ditemukan
    echo json_encode(["status" => "error", "message" => "Login gagal. Periksa kembali NIM/Email dan kata sandi Anda."]);
}

$stmt->close();
$conn->close();
?>