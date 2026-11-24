<?php
// register.php
header("Content-Type: application/json");
require 'koneksi.php';

$nim   = trim($_POST['nim'] ?? '');
$name  = trim($_POST['name'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$pass  = $_POST['password'] ?? '';

if (empty($nim) || empty($name) || empty($email) || empty($pass)) {
    echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi."]);
    exit;
}

// PROTEKSI 1: Tolak jika memakai atribut 'admin' di pendaftaran publik
if (stripos($nim, 'admin') !== false || stripos($name, 'admin') !== false) {
    echo json_encode(["status" => "error", "message" => "ID atau Nama tidak diizinkan menggunakan atribut Admin."]);
    exit;
}

// PROTEKSI 2 (AKUN 1 KAMPUS): Wajib @student.uksw.edu (Mahasiswa) atau @uksw.edu (Dosen/Staf)
$valid_mhs   = substr($email, -strlen('@student.uksw.edu')) === '@student.uksw.edu';
$valid_staff = substr($email, -strlen('@uksw.edu')) === '@uksw.edu';

if (!$valid_mhs && !$valid_staff) {
    echo json_encode(["status" => "error", "message" => "Registrasi ditolak! Wajib menggunakan email resmi @student.uksw.edu atau @uksw.edu."]);
    exit;
}

// Cek apakah NIM/NIP atau Email sudah terdaftar
$cek = $conn->prepare("SELECT nim FROM users WHERE nim = ? OR email = ?");
$cek->bind_param("ss", $nim, $email);
$cek->execute();
if ($cek->get_result()->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "NIM/NIP atau Email sudah terdaftar di sistem."]);
    exit;
}
$cek->close();

// Kunci role pendaftaran publik menjadi 'mhs' (peminjam reguler: mahasiswa/dosen)
$stmt = $conn->prepare("INSERT INTO users (nim, password, role, nama, email) VALUES (?, ?, 'mhs', ?, ?)");
$stmt->bind_param("ssss", $nim, $pass, $name, $email);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "data" => [
            "u" => $nim,
            "role" => "mhs",
            "name" => $name,
            "email" => $email
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal membuat akun sivitas akademika."]);
}

$stmt->close();
$conn->close();
?>