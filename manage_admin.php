<?php
// manage_admin.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
require 'koneksi.php';

$action = $_POST['action'] ?? $_GET['action'] ?? 'list';

if ($action === 'list') {
    $res = $conn->query("SELECT nim, nama, email FROM users WHERE role = 'admin' ORDER BY nim ASC");
    $admins = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $admins[] = $row;
        }
    }
    echo json_encode(["status" => "success", "data" => $admins]);
    exit;
}

if ($action === 'add') {
    $u     = trim($_POST['username'] ?? '');
    $name  = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $pass  = $_POST['password'] ?? '';

    if (empty($u) || empty($name) || empty($email) || empty($pass)) {
        echo json_encode(["status" => "error", "message" => "Semua kolom admin baru wajib diisi."]);
        exit;
    }

    $cek = $conn->prepare("SELECT nim FROM users WHERE nim = ? OR email = ?");
    $cek->bind_param("ss", $u, $email);
    $cek->execute();
    if ($cek->get_result()->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username/NIP atau Email sudah digunakan."]);
        exit;
    }
    $cek->close();

    $stmt = $conn->prepare("INSERT INTO users (nim, password, role, nama, email) VALUES (?, ?, 'admin', ?, ?)");
    $stmt->bind_param("ssss", $u, $pass, $name, $email);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Akun Admin berhasil ditambahkan."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menyimpan admin baru."]);
    }
    $stmt->close();
    exit;
}

if ($action === 'delete') {
    $u = trim($_POST['username'] ?? '');
    if (strtolower($u) === 'admin') {
        echo json_encode(["status" => "error", "message" => "Akun Super Admin utama ('admin') tidak dapat dihapus."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE nim = ? AND role = 'admin'");
    $stmt->bind_param("s", $u);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Gagal menghapus admin."]);
    }
    $stmt->close();
    exit;
}

$conn->close();
?>