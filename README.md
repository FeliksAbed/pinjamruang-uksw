# PinjamRuang — Sistem Informasi Manajemen & Reservasi Ruangan Kampus

Final Project Mata Kuliah **Software Engineering** — Fakultas Teknik Elektronika dan Komputer (FTEK), Universitas Kristen Satya Wacana (UKSW).

## Live Demo Aplikasi
Akses aplikasi web secara langsung melalui tautan berikut:
**[Buka Portal PinjamRuang](http://reservasiruangankampus.fwh.is)**

## Fitur Utama
- **Landing Page & Live Matriks Jadwal:** Filter pencarian ruangan, kapasitas, tanggal, serta status ketersediaan sesi secara *real-time*.
- **Akun 1 Kampus (UKSW):** Registrasi dikunci khusus email resmi `@student.uksw.edu` dan `@uksw.edu` (validasi *client-side* & *server-side*).
- **Pengajuan & Verifikasi Admin TU:** Pengecekan otomatis jadwal bentrok dan waktu WIB, manajemen antrean (*Approve/Reject* + catatan), serta cetak laporan rekapitulasi PDF (`@media print`).
- **Manajemen Ruangan & Multi-Admin TU:** CRUD master ruangan beserta sesi jam (aturan jeda minimal 1 jam) dan pengelolaan akun staf TU.

## Arsitektur & Teknologi
- **Arsitektur:** 3-Tier Client-Server (*Native / Vanilla*, SPA ringan berbasis JSON Fetch API)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Native PHP (`mysqli` dengan *Prepared Statements*)
- **Database:** MariaDB / MySQL (InnoDB, 3 tabel relasional: `users`, `rooms`, `bookings`)
- **Hosting:** InfinityFree (Linux / Apache)

## Dokumentasi Proyek
Seluruh dokumen perancangan dan teknis tersedia di folder `docs/` dan `database/`:
- `docs/FDD_PinjamRuang_Final_Lengkap.docx` — Functional Design Document (Standar SEM-0501)
- `docs/Dokumentasi_Teknis_PinjamRuang-v3.docx` — Dokumentasi Teknis 13 File, Database, & Deployment
- `database/reservasiruang_clean.sql` — Skema & Data Awal Database Siap Import

## Tim Pengembang
Yosua, Kalfin, Feliks, Fanhas, Devidi, Yoga
