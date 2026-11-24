-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql107.infinityfree.com
-- Waktu pembuatan: 23 Nov 2026 pada 21.45
-- Versi server: 11.4.14-MariaDB
-- Versi PHP: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_43387873_reservasiruang`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) NOT NULL,
  `nim` varchar(20) DEFAULT NULL,
  `room_id` varchar(10) DEFAULT NULL,
  `date` date NOT NULL,
  `slot` varchar(50) NOT NULL,
  `purpose` text NOT NULL,
  `participants` int(11) DEFAULT 1,
  `extra_fac` varchar(255) DEFAULT NULL,
  `extra_reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `note` varchar(255) DEFAULT NULL,
  `submitted_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bookings`
--

INSERT INTO `bookings` (`id`, `nim`, `room_id`, `date`, `slot`, `purpose`, `participants`, `extra_fac`, `extra_reason`, `status`, `note`, `submitted_at`) VALUES
(6, '622023005', 'r10884', '2026-11-16', '17.00â€“19.00', 'Kerkom', 25, '', '', 'approved', '', '2026-11-16 00:48:22'),
(7, '622023005', 'r10884', '2026-11-22', '08.00â€“10.00', 'Rapat Angkatan', 12, '', '', 'rejected', '', '2026-11-16 01:27:20'),
(8, '622023002', 'r10884', '2026-11-17', '14.00â€“16.00', 'kelas', 20, '', '', 'approved', '', '2026-11-16 20:17:11');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rooms`
--

CREATE TABLE `rooms` (
  `id` varchar(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `cap` int(11) NOT NULL,
  `fac` varchar(255) NOT NULL,
  `slots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ;

--
-- Dumping data untuk tabel `rooms`
--

INSERT INTO `rooms` (`id`, `name`, `cap`, `fac`, `slots`) VALUES
('r10884', 'C107', 50, 'AC, Proyektor, Papan Tulis, Meja + Kursi, Sound System, Microphone', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]'),
('r23489', 'CX1', 45, 'Meja, Kursi, Interactive Whiteboard, Microphone, Speaker, Colokan, Roll Kabel', '[\"07.00â€“09.00\",\"10.00â€“12.00\",\"13.00â€“15.00\",\"16.00â€“18.00\"]'),
('r41685', 'BB5 (Lab Komputer 2)', 20, 'AC, Papan Tulis, Komputer 1 Set, Meja, Kursi, Colokan, Tempat Penyimpanan', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]'),
('r56468', 'CXY105', 40, 'AC, Proyektor, Papan Tulis, Meja & Kursi', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]'),
('r81133', 'CXY107', 30, 'AC, Papan Tulis, Meja + Kursi', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]'),
('r84921', 'CXY106', 40, 'AC, Proyektor, Papan Tulis, Interactive Whiteboard, Meja & Kursi', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]'),
('r99981', 'BS10 (Lab Komputer 1)', 40, 'AC, Proyektor, Monitor, PC, Papan Tulis, Meja Kursi, Loker Penyimpanan', '[\"08.00â€“10.00\",\"11.00â€“13.00\",\"14.00â€“16.00\",\"17.00â€“19.00\"]');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `nim` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('mhs','admin') NOT NULL DEFAULT 'mhs',
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`nim`, `password`, `role`, `nama`, `email`) VALUES
('622023001', '123456', 'mhs', 'Yosua', '622023001@student.uksw.edu'),
('622023002', 'kalfin123', 'mhs', 'Kalfin Adi Prasetio', '622023002@student.uksw.edu'),
('622023005', 'jimbaran', 'mhs', 'Feliks Narendra', '622023005@student.uksw.edu'),
('admin', 'admin123', 'admin', 'Admin Akademik', 'admin@kampus.ac.id');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nim` (`nim`),
  ADD KEY `room_id` (`room_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`nim`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`nim`) REFERENCES `users` (`nim`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
