-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 13, 2025 at 01:08 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pengaduan_sarpras`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTemporaryItemById` (IN `tempId` INT)   BEGIN
    SELECT ti.*, l.nama_lokasi 
    FROM pengaduan_sarpras_temporary_item ti
    LEFT JOIN pengaduan_sarpras_lokasi l 
        ON ti.id_lokasi = l.id_lokasi
    WHERE ti.id_temporary = tempId;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTemporaryItems` ()   BEGIN
    SELECT ti.*, l.nama_lokasi,
        (SELECT COUNT(*) 
         FROM pengaduan_sarpras_pengaduan p 
         WHERE p.id_temporary = ti.id_temporary) AS jumlah_pengaduan
    FROM pengaduan_sarpras_temporary_item ti
    LEFT JOIN pengaduan_sarpras_lokasi l 
        ON ti.id_lokasi = l.id_lokasi
    ORDER BY ti.id_temporary DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_approve_temporary_item` (IN `p_id_temporary` INT, IN `p_id_admin` INT, OUT `p_new_item_id` INT, OUT `p_status_code` INT, OUT `p_message` VARCHAR(255))   BEGIN
    DECLARE v_temp_status VARCHAR(50);
    DECLARE v_nama_barang VARCHAR(255);
    DECLARE v_id_lokasi INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred';
        SET p_new_item_id = NULL;
    END;

    START TRANSACTION;

    -- Check if temporary item exists
    SELECT status, nama_barang_baru, id_lokasi 
    INTO v_temp_status, v_nama_barang, v_id_lokasi
    FROM pengaduan_sarpras_temporary_item 
    WHERE id_temporary = p_id_temporary;

    -- Validate
    IF v_temp_status IS NULL THEN
        SET p_status_code = 404;
        SET p_message = 'Temporary item tidak ditemukan';
        SET p_new_item_id = NULL;
        ROLLBACK;
    ELSEIF v_temp_status = 'Disetujui' THEN
        SET p_status_code = 400;
        SET p_message = 'Item sudah disetujui sebelumnya';
        SET p_new_item_id = NULL;
        ROLLBACK;
    ELSE
        -- Create official item
        INSERT INTO pengaduan_sarpras_items (nama_item, id_lokasi) 
        VALUES (v_nama_barang, v_id_lokasi);
        
        SET p_new_item_id = LAST_INSERT_ID();

        -- Update temporary item status (using actual column names: nama_admin, tanggal)
        UPDATE pengaduan_sarpras_temporary_item 
        SET status = 'Disetujui', 
            nama_admin = (SELECT nama FROM pengaduan_sarpras_admin WHERE id_admin = p_id_admin),
            tanggal = NOW() 
        WHERE id_temporary = p_id_temporary;

        -- Update all related pengaduan
        UPDATE pengaduan_sarpras_pengaduan 
        SET id_item = p_new_item_id, 
            id_temporary = NULL 
        WHERE id_temporary = p_id_temporary;

        SET p_status_code = 200;
        SET p_message = 'Item berhasil disetujui';
        
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_pengaduan` (IN `p_nama_pengaduan` VARCHAR(255), IN `p_deskripsi` TEXT, IN `p_foto` VARCHAR(500), IN `p_file_id` VARCHAR(255), IN `p_id_user` INT, IN `p_id_item` INT, IN `p_id_lokasi` INT, IN `p_id_temporary` INT, OUT `p_new_id` INT, OUT `p_status_code` INT, OUT `p_message` VARCHAR(500))   BEGIN
    DECLARE v_error_msg VARCHAR(500);
    DECLARE v_errno INT;
    DECLARE v_sqlstate CHAR(5);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_errno = MYSQL_ERRNO,
            v_sqlstate = RETURNED_SQLSTATE,
            v_error_msg = MESSAGE_TEXT;
            
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = CONCAT('Database error: ', v_error_msg, ' (Error: ', v_errno, ', SQLState: ', v_sqlstate, ')');
        SET p_new_id = NULL;
    END;

    START TRANSACTION;

    INSERT INTO pengaduan_sarpras_pengaduan (
        nama_pengaduan, 
        deskripsi, 
        foto, 
        file_id, 
        id_user, 
        id_item, 
        id_lokasi, 
        id_temporary, 
        status, 
        tgl_pengajuan
    ) VALUES (
        p_nama_pengaduan,
        p_deskripsi,
        p_foto,
        p_file_id,
        p_id_user,
        p_id_item,
        p_id_lokasi,
        p_id_temporary,
        'Diajukan',
        CURDATE()
    );

    SET p_new_id = LAST_INSERT_ID();
    SET p_status_code = 201;
    SET p_message = 'Pengaduan berhasil dibuat';
    
    COMMIT;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_reject_temporary_item` (IN `p_id_temporary` INT, IN `p_id_admin` INT, OUT `p_status_code` INT, OUT `p_message` VARCHAR(255))   BEGIN
    DECLARE v_temp_status VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred';
    END;

    START TRANSACTION;

    -- Check if temporary item exists
    SELECT status 
    INTO v_temp_status
    FROM pengaduan_sarpras_temporary_item 
    WHERE id_temporary = p_id_temporary;

    -- Validate
    IF v_temp_status IS NULL THEN
        SET p_status_code = 404;
        SET p_message = 'Temporary item tidak ditemukan';
        ROLLBACK;
    ELSEIF v_temp_status != 'Diproses' THEN
        SET p_status_code = 400;
        SET p_message = 'Item sudah diproses sebelumnya';
        ROLLBACK;
    ELSE
        -- Update status to rejected (using actual column names: nama_admin, tanggal)
        UPDATE pengaduan_sarpras_temporary_item 
        SET status = 'Ditolak', 
            nama_admin = (SELECT nama FROM pengaduan_sarpras_admin WHERE id_admin = p_id_admin),
            tanggal = NOW() 
        WHERE id_temporary = p_id_temporary;

        SET p_status_code = 200;
        SET p_message = 'Item berhasil ditolak';
        
        COMMIT;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_pengaduan_status` (IN `p_id_pengaduan` INT, IN `p_status` VARCHAR(50), IN `p_saran_petugas` TEXT, IN `p_id_petugas` INT, IN `p_tgl_selesai` DATE, OUT `p_status_code` INT, OUT `p_message` VARCHAR(255))   BEGIN
    DECLARE v_exists INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 500;
        SET p_message = 'Database error occurred';
    END;

    START TRANSACTION;

    -- Check if pengaduan exists
    SELECT COUNT(*) 
    INTO v_exists
    FROM pengaduan_sarpras_pengaduan 
    WHERE id_pengaduan = p_id_pengaduan;

    IF v_exists = 0 THEN
        SET p_status_code = 404;
        SET p_message = 'Pengaduan tidak ditemukan';
        ROLLBACK;
    ELSE
        -- Update pengaduan
        UPDATE pengaduan_sarpras_pengaduan 
        SET status = p_status,
            id_petugas = p_id_petugas,
            saran_petugas = p_saran_petugas,
            tgl_selesai = p_tgl_selesai
        WHERE id_pengaduan = p_id_pengaduan;

        SET p_status_code = 200;
        SET p_message = 'Status pengaduan berhasil diupdate';
        
        COMMIT;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `fcm_tokens`
--

CREATE TABLE `fcm_tokens` (
  `id` int NOT NULL DEFAULT '0',
  `user_id` int NOT NULL,
  `fcm_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `fcm_tokens`
--

INSERT INTO `fcm_tokens` (`id`, `user_id`, `fcm_token`, `device_info`, `is_active`, `created_at`, `last_used`) VALUES
(1, 3, 'test-fcm-token-123456', '{\"os\": \"Windows\", \"browser\": \"Chrome\"}', 1, '2025-11-11 07:14:24', '2025-11-11 07:14:24'),
(2, 1, 'web_1_1762856843643_epnh8p', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:27:23.649Z\"}', 1, '2025-11-11 10:27:24', '2025-11-11 10:27:24'),
(3, 1, 'web_1_1762856843723_qxajbr', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:27:23.723Z\"}', 1, '2025-11-11 10:27:24', '2025-11-11 10:27:24'),
(4, 1, 'web_1_1762856861836_289rvb', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:27:41.870Z\"}', 1, '2025-11-11 10:27:42', '2025-11-11 10:27:42'),
(5, 1, 'web_1_1762856862419_bqsjd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:27:42.423Z\"}', 1, '2025-11-11 10:27:42', '2025-11-11 10:27:42'),
(6, 1, 'web_1_1762857025126_95fbra', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:30:25.126Z\"}', 1, '2025-11-11 10:30:25', '2025-11-11 10:30:25'),
(7, 1, 'web_1_1762857025123_g851o', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:30:25.123Z\"}', 1, '2025-11-11 10:30:25', '2025-11-11 10:30:25'),
(8, 1, 'web_1_1762857065498_ao3keb', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:31:05.498Z\"}', 1, '2025-11-11 10:31:06', '2025-11-11 10:31:06'),
(9, 1, 'web_1_1762857065478_boqclk', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:31:05.478Z\"}', 1, '2025-11-11 10:31:07', '2025-11-11 10:31:07'),
(10, 1, 'web_1_1762857157857_ob3sedl', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:32:37.858Z\"}', 1, '2025-11-11 10:32:38', '2025-11-11 10:32:38'),
(11, 1, 'web_1_1762857157874_g3jf3', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:32:37.874Z\"}', 1, '2025-11-11 10:32:38', '2025-11-11 10:32:38'),
(12, 1, 'web_1_1762857205757_7fn5eg', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:33:25.758Z\"}', 1, '2025-11-11 10:33:26', '2025-11-11 10:33:26'),
(13, 1, 'web_1_1762857205763_4snal', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T10:33:25.763Z\"}', 1, '2025-11-11 10:33:26', '2025-11-11 10:33:26'),
(14, 3, 'web_3_1762859022331_jjm3ts', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:03:42.331Z\"}', 1, '2025-11-11 11:03:42', '2025-11-11 11:03:42'),
(15, 3, 'web_3_1762859022344_yzm93s', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:03:42.344Z\"}', 1, '2025-11-11 11:03:42', '2025-11-11 11:03:42'),
(16, 1, 'web_1_1762859132977_mmg2zd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:05:32.977Z\"}', 1, '2025-11-11 11:05:32', '2025-11-11 11:05:32'),
(17, 1, 'web_1_1762860556888_vt40kk', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:16.888Z\"}', 1, '2025-11-11 11:29:18', '2025-11-11 11:29:18'),
(18, 1, 'web_1_1762860556880_9xw3jm', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:16.880Z\"}', 1, '2025-11-11 11:29:18', '2025-11-11 11:29:18'),
(19, 1, 'web_1_1762860558944_ukym2j', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:18.945Z\"}', 1, '2025-11-11 11:29:19', '2025-11-11 11:29:19'),
(20, 1, 'web_1_1762860558947_6qhmq6', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:18.947Z\"}', 1, '2025-11-11 11:29:19', '2025-11-11 11:29:19'),
(21, 1, 'web_1_1762860560389_1lw1tf', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:20.391Z\"}', 1, '2025-11-11 11:29:20', '2025-11-11 11:29:20'),
(22, 1, 'web_1_1762860560394_ok3vb', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:20.395Z\"}', 1, '2025-11-11 11:29:20', '2025-11-11 11:29:20'),
(23, 1, 'web_1_1762860568023_fmgzto', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:28.023Z\"}', 1, '2025-11-11 11:29:28', '2025-11-11 11:29:28'),
(24, 1, 'web_1_1762860568025_nios7h', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:28.026Z\"}', 1, '2025-11-11 11:29:28', '2025-11-11 11:29:28'),
(25, 1, 'web_1_1762860590871_qbqa', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:29:50.872Z\"}', 1, '2025-11-11 11:29:51', '2025-11-11 11:29:51'),
(26, 1, 'web_1_1762861160764_oxl5q9', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:39:20.764Z\"}', 1, '2025-11-11 11:39:21', '2025-11-11 11:39:21'),
(27, 1, 'web_1_1762861160775_x3k5lai', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:39:20.776Z\"}', 1, '2025-11-11 11:39:21', '2025-11-11 11:39:21'),
(28, 1, 'web_1_1762861336894_6coit', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:42:16.894Z\"}', 1, '2025-11-11 11:42:17', '2025-11-11 11:42:17'),
(29, 1, 'web_1_1762861336886_s10dub', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:42:16.886Z\"}', 1, '2025-11-11 11:42:17', '2025-11-11 11:42:17'),
(30, 1, 'web_1_1762861377304_akz44l', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:42:57.304Z\"}', 1, '2025-11-11 11:42:57', '2025-11-11 11:42:57'),
(31, 1, 'web_1_1762861377312_bnavja', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:42:57.312Z\"}', 1, '2025-11-11 11:42:57', '2025-11-11 11:42:57'),
(32, 1, 'web_1_1762862119192_t3rdu', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:55:19.192Z\"}', 1, '2025-11-11 11:55:19', '2025-11-11 11:55:19'),
(33, 1, 'web_1_1762862119201_3n3wmm', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:55:19.201Z\"}', 1, '2025-11-11 11:55:19', '2025-11-11 11:55:19'),
(34, 1, 'web_1_1762862161387_wdjypg', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:56:01.387Z\"}', 1, '2025-11-11 11:56:01', '2025-11-11 11:56:01'),
(35, 1, 'web_1_1762862161381_8ydbzl', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:56:01.381Z\"}', 1, '2025-11-11 11:56:01', '2025-11-11 11:56:01'),
(36, 1, 'web_1_1762862217491_wctgpc', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:56:57.491Z\"}', 1, '2025-11-11 11:56:58', '2025-11-11 11:56:58'),
(37, 1, 'web_1_1762862217480_hrwqd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T11:56:57.480Z\"}', 1, '2025-11-11 11:56:58', '2025-11-11 11:56:58'),
(38, 1, 'web_1_1762863516370_lwtpjf', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:18:36.370Z\"}', 1, '2025-11-11 12:18:37', '2025-11-11 12:18:37'),
(39, 1, 'web_1_1762863516365_wqzha', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:18:36.365Z\"}', 1, '2025-11-11 12:18:37', '2025-11-11 12:18:37'),
(40, 1, 'web_1_1762863527575_gix34v', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:18:47.575Z\"}', 1, '2025-11-11 12:18:47', '2025-11-11 12:18:47'),
(41, 1, 'web_1_1762863527578_ns6i5t', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:18:47.578Z\"}', 1, '2025-11-11 12:18:47', '2025-11-11 12:18:47'),
(42, 1, 'web_1_1762863569317_xec737', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:19:29.317Z\"}', 1, '2025-11-11 12:19:29', '2025-11-11 12:19:29'),
(43, 1, 'web_1_1762863569320_zqoq2p', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:19:29.320Z\"}', 1, '2025-11-11 12:19:29', '2025-11-11 12:19:29'),
(44, 1, 'web_1_1762863717539_si2a9s', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:21:57.540Z\"}', 1, '2025-11-11 12:21:58', '2025-11-11 12:21:58'),
(45, 1, 'web_1_1762863717561_2rey7g', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:21:57.561Z\"}', 1, '2025-11-11 12:21:58', '2025-11-11 12:21:58'),
(46, 1, 'web_1_1762863758393_qzi8b8', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:22:38.393Z\"}', 1, '2025-11-11 12:22:38', '2025-11-11 12:22:38'),
(47, 1, 'web_1_1762863758386_pro6v8', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:22:38.387Z\"}', 1, '2025-11-11 12:22:38', '2025-11-11 12:22:38'),
(48, 1, 'web_1_1762864039814_g81vlh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:27:19.814Z\"}', 1, '2025-11-11 12:27:20', '2025-11-11 12:27:20'),
(49, 1, 'web_1_1762864039805_m9qybs', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:27:19.806Z\"}', 1, '2025-11-11 12:27:20', '2025-11-11 12:27:20'),
(50, 1, 'web_1_1762864121485_ej94t', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:28:41.485Z\"}', 1, '2025-11-11 12:28:41', '2025-11-11 12:28:41'),
(51, 1, 'web_1_1762864121478_xyck84', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:28:41.478Z\"}', 1, '2025-11-11 12:28:41', '2025-11-11 12:28:41'),
(52, 1, 'web_1_1762864154245_77jjgi', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:29:14.246Z\"}', 1, '2025-11-11 12:29:14', '2025-11-11 12:29:14'),
(53, 1, 'web_1_1762864154324_8d171d', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:29:14.331Z\"}', 1, '2025-11-11 12:29:14', '2025-11-11 12:29:14'),
(54, 1, 'web_1_1762864185820_n6x0gh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:29:45.824Z\"}', 1, '2025-11-11 12:29:46', '2025-11-11 12:29:46'),
(55, 1, 'web_1_1762864185870_c90j3k', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:29:45.870Z\"}', 1, '2025-11-11 12:29:46', '2025-11-11 12:29:46'),
(56, 1, 'web_1_1762864243824_jbmft7', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:30:43.825Z\"}', 1, '2025-11-11 12:30:44', '2025-11-11 12:30:44'),
(57, 1, 'web_1_1762864243848_bpyunn', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:30:43.848Z\"}', 1, '2025-11-11 12:30:44', '2025-11-11 12:30:44'),
(58, 1, 'web_1_1762864472870_usc5x', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:34:32.870Z\"}', 1, '2025-11-11 12:34:33', '2025-11-11 12:34:33'),
(59, 1, 'web_1_1762864472863_kfzyy', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:34:32.863Z\"}', 1, '2025-11-11 12:34:33', '2025-11-11 12:34:33'),
(60, 3, 'web_3_1762864487737_hdpxgt', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:34:47.737Z\"}', 1, '2025-11-11 12:34:47', '2025-11-11 12:34:47'),
(61, 3, 'web_3_1762864487722_3sboxd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:34:47.723Z\"}', 1, '2025-11-11 12:34:47', '2025-11-11 12:34:47'),
(62, 1, 'web_1_1762864525086_bw99rl', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:35:25.086Z\"}', 1, '2025-11-11 12:35:25', '2025-11-11 12:35:25'),
(63, 1, 'web_1_1762864525090_15dmss', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:35:25.090Z\"}', 1, '2025-11-11 12:35:25', '2025-11-11 12:35:25'),
(64, 1, 'web_1_1762864693511_f7tikh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:13.511Z\"}', 1, '2025-11-11 12:38:14', '2025-11-11 12:38:14'),
(65, 1, 'web_1_1762864694940_p2ve1r', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:14.940Z\"}', 1, '2025-11-11 12:38:14', '2025-11-11 12:38:14'),
(66, 3, 'web_3_1762864719005_gu6b8m', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:39.007Z\"}', 1, '2025-11-11 12:38:39', '2025-11-11 12:38:39'),
(67, 3, 'web_3_1762864719591_qpaytr', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:39.592Z\"}', 1, '2025-11-11 12:38:39', '2025-11-11 12:38:39'),
(68, 1, 'web_1_1762864734077_0kvclh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:54.078Z\"}', 1, '2025-11-11 12:38:54', '2025-11-11 12:38:54'),
(69, 1, 'web_1_1762864734085_wbu9pf', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:38:54.085Z\"}', 1, '2025-11-11 12:38:54', '2025-11-11 12:38:54'),
(70, 3, 'web_3_1762864761091_bchttio', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:39:21.092Z\"}', 1, '2025-11-11 12:39:21', '2025-11-11 12:39:21'),
(71, 3, 'web_3_1762864761274_rfh85', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:39:21.274Z\"}', 1, '2025-11-11 12:39:21', '2025-11-11 12:39:21'),
(72, 1, 'web_1_1762864773497_xoa3ov', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:39:33.497Z\"}', 1, '2025-11-11 12:39:33', '2025-11-11 12:39:33'),
(73, 1, 'web_1_1762864773489_0obh6c', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:39:33.490Z\"}', 1, '2025-11-11 12:39:33', '2025-11-11 12:39:33'),
(74, 3, 'web_3_1762864816752_csrp1', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:40:16.767Z\"}', 1, '2025-11-11 12:40:16', '2025-11-11 12:40:16'),
(75, 3, 'web_3_1762864816978_13ia5', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T12:40:16.978Z\"}', 1, '2025-11-11 12:40:16', '2025-11-11 12:40:16'),
(76, 3, 'web_3_1762866842335_go9dkh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:14:02.336Z\"}', 1, '2025-11-11 13:14:02', '2025-11-11 13:14:02'),
(77, 3, 'web_3_1762866842311_2zumbe', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:14:02.316Z\"}', 1, '2025-11-11 13:14:02', '2025-11-11 13:14:02'),
(78, 1, 'web_1_1762866868539_y46agi', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:14:28.540Z\"}', 1, '2025-11-11 13:14:28', '2025-11-11 13:14:28'),
(79, 1, 'web_1_1762866868547_avufnx', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:14:28.547Z\"}', 1, '2025-11-11 13:14:28', '2025-11-11 13:14:28'),
(80, 3, 'web_3_1762866943028_8wcod', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:15:43.028Z\"}', 1, '2025-11-11 13:15:43', '2025-11-11 13:15:43'),
(81, 3, 'web_3_1762866943026_xpof2f', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0\", \"language\": \"id\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:15:43.026Z\"}', 1, '2025-11-11 13:15:43', '2025-11-11 13:15:43'),
(82, 1, 'web_1_1762867406913_zmvu0d', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:23:26.913Z\"}', 1, '2025-11-11 13:23:26', '2025-11-11 13:23:26'),
(83, 3, 'web_3_1762867617737_nmaz3', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:26:57.737Z\"}', 1, '2025-11-11 13:26:57', '2025-11-11 13:26:57'),
(84, 3, 'web_3_1762867617745_qe2zy', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:26:57.745Z\"}', 1, '2025-11-11 13:26:58', '2025-11-11 13:26:58'),
(85, 1, 'web_1_1762867627577_57btk8', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:07.579Z\"}', 1, '2025-11-11 13:27:08', '2025-11-11 13:27:08'),
(86, 1, 'web_1_1762867627596_qbtyni', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:07.596Z\"}', 1, '2025-11-11 13:27:08', '2025-11-11 13:27:08'),
(87, 3, 'web_3_1762867641054_vyir6x', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:21.055Z\"}', 1, '2025-11-11 13:27:21', '2025-11-11 13:27:21'),
(88, 3, 'web_3_1762867641057_z917ba', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:21.058Z\"}', 1, '2025-11-11 13:27:21', '2025-11-11 13:27:21'),
(89, 1, 'web_1_1762867644924_6skpnk', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:24.926Z\"}', 1, '2025-11-11 13:27:25', '2025-11-11 13:27:25'),
(90, 1, 'web_1_1762867644937_1dfpp', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:27:24.937Z\"}', 1, '2025-11-11 13:27:25', '2025-11-11 13:27:25'),
(91, 3, 'web_3_1762867693013_3h2l9h', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:28:13.013Z\"}', 1, '2025-11-11 13:28:13', '2025-11-11 13:28:13'),
(92, 3, 'web_3_1762867693007_1w7wgk', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:28:13.008Z\"}', 1, '2025-11-11 13:28:13', '2025-11-11 13:28:13'),
(93, 1, 'web_1_1762867699137_sbg76', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:28:19.151Z\"}', 1, '2025-11-11 13:28:19', '2025-11-11 13:28:19'),
(94, 1, 'web_1_1762867699245_q1eseq', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:28:19.245Z\"}', 1, '2025-11-11 13:28:19', '2025-11-11 13:28:19'),
(95, 3, 'web_3_1762867793113_cs8cwq', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:29:53.113Z\"}', 1, '2025-11-11 13:29:53', '2025-11-11 13:29:53'),
(96, 3, 'web_3_1762867793117_4eq5fm', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:29:53.118Z\"}', 1, '2025-11-11 13:29:53', '2025-11-11 13:29:53'),
(97, 1, 'web_1_1762868121151_nypvam', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:35:21.151Z\"}', 1, '2025-11-11 13:35:21', '2025-11-11 13:35:21'),
(98, 3, 'web_3_1762868132379_mzewvk', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:35:32.379Z\"}', 1, '2025-11-11 13:35:32', '2025-11-11 13:35:32'),
(99, 3, 'web_3_1762868132385_l9lck', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:35:32.385Z\"}', 1, '2025-11-11 13:35:32', '2025-11-11 13:35:32'),
(100, 3, 'web_3_1762868331244_upanz', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:38:51.245Z\"}', 1, '2025-11-11 13:38:51', '2025-11-11 13:38:51'),
(101, 3, 'web_3_1762868331250_hpwals', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T13:38:51.250Z\"}', 1, '2025-11-11 13:38:51', '2025-11-11 13:38:51'),
(102, 1, 'web_1_1762870515233_rrgonb', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T14:15:15.233Z\"}', 1, '2025-11-11 14:15:15', '2025-11-11 14:15:15'),
(103, 1, 'web_1_1762870515167_bccmn', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T14:15:15.168Z\"}', 1, '2025-11-11 14:15:15', '2025-11-11 14:15:15'),
(104, 1, 'web_1_1762905083445_8wqugq', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:51:23.445Z\"}', 1, '2025-11-11 23:51:24', '2025-11-11 23:51:24'),
(105, 1, 'web_1_1762905083449_enb9bg', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:51:23.450Z\"}', 1, '2025-11-11 23:51:24', '2025-11-11 23:51:24'),
(106, 3, 'web_3_1762905525817_6rsjd5', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:58:45.817Z\"}', 1, '2025-11-11 23:58:46', '2025-11-11 23:58:46'),
(107, 3, 'web_3_1762905525823_ig8syd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:58:45.823Z\"}', 1, '2025-11-11 23:58:47', '2025-11-11 23:58:47'),
(108, 3, 'web_3_1762905527962_0yct6', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:58:47.964Z\"}', 1, '2025-11-11 23:58:48', '2025-11-11 23:58:48'),
(109, 3, 'web_3_1762905528026_ed836k', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-11T23:58:48.026Z\"}', 1, '2025-11-11 23:58:48', '2025-11-11 23:58:48'),
(110, 4, 'web_4_1762906639080_qcqr1', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:19.081Z\"}', 1, '2025-11-12 00:17:19', '2025-11-12 00:17:19'),
(111, 4, 'web_4_1762906639088_24pvbn', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:19.089Z\"}', 1, '2025-11-12 00:17:19', '2025-11-12 00:17:19'),
(112, 4, 'web_4_1762906652686_i2l0zd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:32.686Z\"}', 1, '2025-11-12 00:17:32', '2025-11-12 00:17:32'),
(113, 4, 'web_4_1762906652682_pf37z', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:32.683Z\"}', 1, '2025-11-12 00:17:33', '2025-11-12 00:17:33'),
(114, 4, 'web_4_1762906663853_9c3vp', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:43.861Z\"}', 1, '2025-11-12 00:17:43', '2025-11-12 00:17:43'),
(115, 4, 'web_4_1762906663901_rbsp5h', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T00:17:43.902Z\"}', 1, '2025-11-12 00:17:43', '2025-11-12 00:17:43'),
(116, 3, 'web_3_1762917452964_6g16r8', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:17:32.965Z\"}', 1, '2025-11-12 03:17:32', '2025-11-12 03:17:32'),
(117, 3, 'web_3_1762917452970_5746k', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:17:32.970Z\"}', 1, '2025-11-12 03:17:33', '2025-11-12 03:17:33'),
(118, 3, 'web_3_1762917682943_phzkw4', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:22.943Z\"}', 1, '2025-11-12 03:21:23', '2025-11-12 03:21:23'),
(119, 3, 'web_3_1762917682946_v1cx47', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:22.946Z\"}', 1, '2025-11-12 03:21:23', '2025-11-12 03:21:23'),
(120, 1, 'web_1_1762917698056_arjjb8', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:38.057Z\"}', 1, '2025-11-12 03:21:38', '2025-11-12 03:21:38'),
(121, 1, 'web_1_1762917698052_6ceiip', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:38.052Z\"}', 1, '2025-11-12 03:21:38', '2025-11-12 03:21:38'),
(122, 3, 'web_3_1762917719088_u05s5', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:59.088Z\"}', 1, '2025-11-12 03:21:59', '2025-11-12 03:21:59'),
(123, 3, 'web_3_1762917719097_22fkvp', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:21:59.098Z\"}', 1, '2025-11-12 03:21:59', '2025-11-12 03:21:59'),
(124, 3, 'web_3_1762917883054_t4mo1c', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:24:43.055Z\"}', 1, '2025-11-12 03:24:43', '2025-11-12 03:24:43'),
(125, 3, 'web_3_1762917883058_stft1', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:24:43.058Z\"}', 1, '2025-11-12 03:24:43', '2025-11-12 03:24:43'),
(126, 1, 'web_1_1762918148872_c2s31u', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:08.872Z\"}', 1, '2025-11-12 03:29:09', '2025-11-12 03:29:09'),
(127, 1, 'web_1_1762918148845_vyd58c', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:08.848Z\"}', 1, '2025-11-12 03:29:09', '2025-11-12 03:29:09'),
(128, 3, 'web_3_1762918149361_jbukov', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:09.362Z\"}', 1, '2025-11-12 03:29:09', '2025-11-12 03:29:09'),
(129, 3, 'web_3_1762918149412_a0rg7k', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:09.412Z\"}', 1, '2025-11-12 03:29:09', '2025-11-12 03:29:09'),
(130, 3, 'web_3_1762918189038_szxefs', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:49.038Z\"}', 1, '2025-11-12 03:29:49', '2025-11-12 03:29:49'),
(131, 3, 'web_3_1762918189024_adixmp', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:49.024Z\"}', 1, '2025-11-12 03:29:49', '2025-11-12 03:29:49'),
(132, 1, 'web_1_1762918188954_rrywem', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:48.954Z\"}', 1, '2025-11-12 03:29:49', '2025-11-12 03:29:49'),
(133, 1, 'web_1_1762918188938_ro37zd', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:29:48.938Z\"}', 1, '2025-11-12 03:29:49', '2025-11-12 03:29:49'),
(134, 1, 'web_1_1762918368133_epzikh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:32:48.134Z\"}', 1, '2025-11-12 03:32:48', '2025-11-12 03:32:48'),
(135, 1, 'web_1_1762918368140_gkgmd5', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:32:48.140Z\"}', 1, '2025-11-12 03:32:48', '2025-11-12 03:32:48'),
(136, 3, 'web_3_1762918658084_9u1abj', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:37:38.085Z\"}', 1, '2025-11-12 03:37:38', '2025-11-12 03:37:38'),
(137, 1, 'web_1_1762918658085_mkfleo', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:37:38.086Z\"}', 1, '2025-11-12 03:37:38', '2025-11-12 03:37:38'),
(138, 3, 'web_3_1762918658098_skotyzh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:37:38.098Z\"}', 1, '2025-11-12 03:37:38', '2025-11-12 03:37:38'),
(139, 1, 'web_1_1762918658097_epckh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T03:37:38.097Z\"}', 1, '2025-11-12 03:37:38', '2025-11-12 03:37:38'),
(0, 3, 'web_3_1762925213355_19p727', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T05:27:21.475Z\"}', 1, '2025-11-12 05:27:37', '2025-11-12 05:27:37'),
(0, 3, 'web_3_1762925324377_uyoash', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T05:28:44.406Z\"}', 1, '2025-11-12 05:28:46', '2025-11-12 05:28:46'),
(0, 1, 'web_1_1762925337051_vya98l', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T05:28:57.429Z\"}', 1, '2025-11-12 05:28:58', '2025-11-12 05:28:58'),
(0, 1, 'web_1_1762925337779_a3l1b', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T05:28:57.779Z\"}', 1, '2025-11-12 05:28:58', '2025-11-12 05:28:58'),
(0, 1, 'web_1_1762929041377_2y8htn', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:30:41.378Z\"}', 1, '2025-11-12 06:30:42', '2025-11-12 06:30:42'),
(0, 1, 'web_1_1762929041372_uro80r', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:30:41.373Z\"}', 1, '2025-11-12 06:30:42', '2025-11-12 06:30:42'),
(0, 1, 'web_1_1762929078131_za3hcq', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:31:18.131Z\"}', 1, '2025-11-12 06:31:18', '2025-11-12 06:31:18'),
(0, 1, 'web_1_1762929078135_gkrfn', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:31:18.135Z\"}', 1, '2025-11-12 06:31:18', '2025-11-12 06:31:18'),
(0, 1, 'web_1_1762929097987_iwi949', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:31:37.988Z\"}', 1, '2025-11-12 06:31:38', '2025-11-12 06:31:38'),
(0, 1, 'web_1_1762929097996_6qgr9s', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:31:37.996Z\"}', 1, '2025-11-12 06:31:38', '2025-11-12 06:31:38'),
(0, 1, 'web_1_1762929366070_89y24b', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:36:06.070Z\"}', 1, '2025-11-12 06:36:06', '2025-11-12 06:36:06'),
(0, 1, 'web_1_1762929366371_lf0mbh', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:36:06.371Z\"}', 1, '2025-11-12 06:36:06', '2025-11-12 06:36:06'),
(0, 1, 'web_1_1762929366063_avldf', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:36:06.063Z\"}', 1, '2025-11-12 06:36:06', '2025-11-12 06:36:06'),
(0, 1, 'web_1_1762929366365_dbazx', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:36:06.366Z\"}', 1, '2025-11-12 06:36:06', '2025-11-12 06:36:06'),
(0, 1, 'web_1_1762930691406_t0sd4o', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:58:11.413Z\"}', 1, '2025-11-12 06:58:11', '2025-11-12 06:58:11'),
(0, 1, 'web_1_1762930691447_0xvd54', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T06:58:11.447Z\"}', 1, '2025-11-12 06:58:11', '2025-11-12 06:58:11'),
(0, 1, 'web_1_1762931105897_mihfvy', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:05:05.908Z\"}', 1, '2025-11-12 07:05:06', '2025-11-12 07:05:06'),
(0, 1, 'web_1_1762931105937_owam7', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:05:05.938Z\"}', 1, '2025-11-12 07:05:06', '2025-11-12 07:05:06'),
(0, 1, 'web_1_1762932175442_b1ek4s', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:22:55.443Z\"}', 1, '2025-11-12 07:22:55', '2025-11-12 07:22:55'),
(0, 1, 'web_1_1762932175490_8o3pf', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:22:55.490Z\"}', 1, '2025-11-12 07:22:55', '2025-11-12 07:22:55'),
(0, 1, 'web_1_1762932313251_ypnv9p', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:25:13.252Z\"}', 1, '2025-11-12 07:25:14', '2025-11-12 07:25:14');
INSERT INTO `fcm_tokens` (`id`, `user_id`, `fcm_token`, `device_info`, `is_active`, `created_at`, `last_used`) VALUES
(0, 1, 'web_1_1762932313260_yoi27s', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T07:25:13.260Z\"}', 1, '2025-11-12 07:25:14', '2025-11-12 07:25:14'),
(0, 1, 'web_1_1762952628392_wurbvq', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T13:03:48.392Z\"}', 1, '2025-11-12 13:03:49', '2025-11-12 13:03:49'),
(0, 1, 'web_1_1762952628386_97mtxl', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T13:03:48.387Z\"}', 1, '2025-11-12 13:03:49', '2025-11-12 13:03:49'),
(0, 3, 'web_3_1762952792714_digd7a', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T13:06:32.714Z\"}', 1, '2025-11-12 13:06:32', '2025-11-12 13:06:32'),
(0, 3, 'web_3_1762952792722_lc1yi', '{\"browser\": \"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36\", \"language\": \"en-GB\", \"platform\": \"Win32\", \"timestamp\": \"2025-11-12T13:06:32.723Z\"}', 1, '2025-11-12 13:06:32', '2025-11-12 13:06:32');

-- --------------------------------------------------------

--
-- Table structure for table `notification_history`
--

CREATE TABLE `notification_history` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data` json DEFAULT NULL,
  `status` enum('sent','failed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_history`
--

INSERT INTO `notification_history` (`id`, `user_id`, `title`, `body`, `type`, `data`, `status`, `is_read`, `read_at`, `sent_at`) VALUES
(1, 3, 'Status Pengaduan 📋', 'tes fcm - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"57\"}', 'sent', 1, NULL, '2025-11-11 11:30:32'),
(2, 1, 'Pengaduan Baru 📋', 'halo - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-11 11:31:56'),
(3, 1, 'Pengaduan Baru 📋', 'asdfsd - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-11 12:19:14'),
(4, 1, 'Pengaduan Baru 📋', 'dsfsdf - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-11 12:35:00'),
(5, 3, 'Status Pengaduan 📋', 'dsfsdf - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"61\"}', 'sent', 1, NULL, '2025-11-11 12:35:36'),
(6, 3, 'Status Pengaduan 🔄', 'asdfsd - Diproses', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Diproses\", \"pengaduan_id\": \"60\"}', 'sent', 1, NULL, '2025-11-11 12:45:54'),
(7, 1, 'Pengaduan Baru 📋', 'sdfsad - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-11 13:14:16'),
(8, 3, 'Status Pengaduan ❌', 'sdfsad - Ditolak', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Ditolak\", \"pengaduan_id\": \"62\"}', 'sent', 1, NULL, '2025-11-11 13:14:51'),
(9, 3, 'Status Pengaduan ✅', 'asdfsd - Selesai', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Selesai\", \"pengaduan_id\": \"60\"}', 'sent', 1, NULL, '2025-11-11 13:24:51'),
(10, 3, 'Status Pengaduan 📋', 'halo - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"59\"}', 'sent', 1, NULL, '2025-11-11 13:34:50'),
(11, 3, 'Status Pengaduan ✅', 'halo - Selesai', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Selesai\", \"pengaduan_id\": \"59\"}', 'sent', 1, NULL, '2025-11-11 13:35:51'),
(12, 1, 'Pengaduan Baru 📋', 'maul - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-12 03:16:14'),
(13, 1, 'Pengaduan Baru 📋', 'fasdf - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 1, NULL, '2025-11-12 03:17:14'),
(14, 3, 'Status Pengaduan 📋', 'fasdf - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"64\"}', 'sent', 0, NULL, '2025-11-12 03:22:24'),
(15, 3, 'Status Pengaduan 📋', 'maul - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"63\"}', 'sent', 0, NULL, '2025-11-12 03:24:03'),
(16, 1, 'Pengaduan Baru 📋', 'tes juga - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 0, NULL, '2025-11-12 03:25:47'),
(17, 3, 'Status Pengaduan 📋', 'tes juga - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"65\"}', 'sent', 0, NULL, '2025-11-12 03:33:16'),
(18, 3, 'Status Pengaduan 📋', 'tes - Disetujui', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Disetujui\", \"pengaduan_id\": \"66\"}', 'failed', 0, NULL, '2025-11-12 05:15:01'),
(19, 3, 'Status Pengaduan 🔄', 'tes - Diproses', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Diproses\", \"pengaduan_id\": \"66\"}', 'failed', 0, NULL, '2025-11-12 05:15:54'),
(20, 1, 'Pengaduan Baru 📋', 'ee gatau juga - Menunggu ditinjau', 'new_pengaduan', '{\"url\": \"/admin/pengaduan\", \"type\": \"new_pengaduan\"}', 'sent', 0, NULL, '2025-11-12 13:09:15'),
(21, 3, 'Status Pengaduan 🔄', 'ee gatau juga - Diproses', 'status_update', '{\"url\": \"/dashboard/riwayat\", \"type\": \"status_update\", \"status\": \"Diproses\", \"pengaduan_id\": \"67\"}', 'sent', 0, NULL, '2025-11-12 13:09:36');

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_items`
--

CREATE TABLE `pengaduan_sarpras_items` (
  `id_item` int NOT NULL,
  `nama_item` varchar(200) NOT NULL,
  `deskripsi` text,
  `foto` varchar(255) DEFAULT NULL,
  `id_lokasi` int DEFAULT NULL,
  `file_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_items`
--

INSERT INTO `pengaduan_sarpras_items` (`id_item`, `nama_item`, `deskripsi`, `foto`, `id_lokasi`, `file_id`) VALUES
(10, 'Komputer', 'Komputer lap 2', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Items/item_1757637268857_apps_9EdI8PVv9.png', 2, '68c36ac25c7cd75eb87aa399'),
(11, 'Mouse', 'Mouse lap 2', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Items/1758058154912_apps_7wZP9-55F.png', 2, '68c9d6e85c7cd75eb897fe9f'),
(15, 'Rumah', NULL, NULL, 2, NULL),
(16, 'Rumah', NULL, NULL, 2, NULL),
(26, 'makna', NULL, NULL, 2, NULL),
(27, 'komputer', 'komputer', NULL, 7, NULL),
(28, 'komputer', 'komputer', NULL, 7, NULL),
(30, 'meja', NULL, NULL, 11, NULL),
(32, 'meja', NULL, NULL, 11, NULL),
(34, 'meja', NULL, NULL, 11, NULL),
(36, 'meja', NULL, NULL, 11, NULL),
(38, 'meja', NULL, NULL, 11, NULL),
(40, 'meja', NULL, NULL, 11, NULL),
(42, 'meja', NULL, NULL, 11, NULL),
(44, 'meja', NULL, NULL, 11, NULL),
(46, 'meja', NULL, NULL, 11, NULL),
(48, 'hello', NULL, NULL, 10, NULL),
(50, 'gelas', NULL, NULL, 9, NULL),
(51, 'gelas', 'sebuah gelas', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Items/1762755644526_Screenshot_2025-05-24_183717_TH9FBxvl2.png', 12, '691184ba5c7cd75eb83b5b92'),
(52, 'makan', 'sdfasfa', NULL, 9, NULL),
(53, 'gula', 'gulanya hilang pak', NULL, 9, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_kategori_lokasi`
--

CREATE TABLE `pengaduan_sarpras_kategori_lokasi` (
  `id_kategori` int NOT NULL,
  `nama_kategori` varchar(100) NOT NULL,
  `deskripsi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_kategori_lokasi`
--

INSERT INTO `pengaduan_sarpras_kategori_lokasi` (`id_kategori`, `nama_kategori`, `deskripsi`, `created_at`) VALUES
(1, 'Laboratorium', 'Lab', '2025-11-05 19:01:59'),
(2, 'Ruang Kelas', 'ruang kelas', '2025-11-05 19:01:59');

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_lokasi`
--

CREATE TABLE `pengaduan_sarpras_lokasi` (
  `id_lokasi` int NOT NULL,
  `nama_lokasi` varchar(200) NOT NULL,
  `id_kategori` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_lokasi`
--

INSERT INTO `pengaduan_sarpras_lokasi` (`id_lokasi`, `nama_lokasi`, `id_kategori`) VALUES
(2, 'Lab 2', NULL),
(7, 'Lab Komputer 1', 1),
(8, 'Lab Komputer 2', 1),
(9, 'Lab Kimia', 1),
(10, 'Kelas A-101', 2),
(11, 'Kelas A-102', 2),
(12, 'Ruang 10', NULL),
(13, 'Ruang 1', 2);

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_pengaduan`
--

CREATE TABLE `pengaduan_sarpras_pengaduan` (
  `id_pengaduan` int NOT NULL,
  `nama_pengaduan` varchar(200) NOT NULL,
  `deskripsi` text,
  `foto` varchar(255) DEFAULT NULL,
  `status` enum('Diajukan','Disetujui','Ditolak','Diproses','Selesai') DEFAULT 'Diajukan',
  `id_user` int DEFAULT NULL,
  `id_petugas` int DEFAULT NULL,
  `id_item` int DEFAULT NULL,
  `id_lokasi` int DEFAULT NULL,
  `id_temporary` int DEFAULT NULL,
  `tgl_pengajuan` date DEFAULT NULL,
  `tgl_selesai` date DEFAULT NULL,
  `saran_petugas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `file_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_pengaduan`
--

INSERT INTO `pengaduan_sarpras_pengaduan` (`id_pengaduan`, `nama_pengaduan`, `deskripsi`, `foto`, `status`, `id_user`, `id_petugas`, `id_item`, `id_lokasi`, `id_temporary`, `tgl_pengajuan`, `tgl_selesai`, `saran_petugas`, `created_at`, `updated_at`, `file_id`) VALUES
(6, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757655970308_download_gRRT25iz2.jpg', 'Disetujui', 5, 1, 10, 2, NULL, '2025-09-12', NULL, 'Noted', '2025-09-12 05:46:13', '2025-09-12 05:46:55', '68c3b3d05c7cd75eb89f62ec'),
(7, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757656022374_download_g83lYFwU0.jpg', 'Disetujui', 5, 1, 10, 2, NULL, '2025-09-12', NULL, 'Noted', '2025-09-12 05:47:04', '2025-09-12 05:48:34', '68c3b4035c7cd75eb8a0e634'),
(8, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757656026825_download_N-kSP8uxu.jpg', 'Disetujui', 5, 1, 10, 2, NULL, '2025-09-12', NULL, 'Noted', '2025-09-12 05:47:09', '2025-09-12 05:49:13', '68c3b4085c7cd75eb8a0f7f6'),
(9, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757656031050_download_z17eeDMq4.jpg', 'Diajukan', 5, NULL, 10, 2, NULL, '2025-09-12', NULL, NULL, '2025-09-12 05:47:13', '2025-09-12 05:47:13', '68c3b40c5c7cd75eb8a109d2'),
(10, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757656035629_download_idLue_MmY.jpg', 'Diajukan', 5, NULL, 10, 2, NULL, '2025-09-12', NULL, NULL, '2025-09-12 05:47:18', '2025-09-12 05:47:18', '68c3b4115c7cd75eb8a1279c'),
(11, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/pengaduan_1757656126660_download_G6JgSwrRl.jpg', 'Diajukan', 5, NULL, 10, 2, NULL, '2025-09-12', NULL, NULL, '2025-09-12 05:48:49', '2025-09-12 05:48:49', '68c3b46c5c7cd75eb8a31348'),
(20, 'percobaan', 'ini adalah percobaan untuk notif real time dengan menggunakan firebase', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1758375876573_Screenshot_2025-05-28_083655_9Ubk9JJDe.png', 'Selesai', 3, 1, 10, 2, NULL, '2025-09-20', '2025-09-20', NULL, '2025-09-20 13:44:40', '2025-09-20 13:45:42', '68ceb0015c7cd75eb8ba7b28'),
(26, 'tes FCM', 'tes aja buat FCM', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1759579379371_rumahfais_U800cwEAW.png', 'Diproses', 3, NULL, 11, 2, NULL, '2025-10-04', NULL, NULL, '2025-10-04 12:03:01', '2025-10-12 13:50:24', '68e10d425c7cd75eb8e4116d'),
(27, 'dsfasdf', 'fasdf', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1759579935599_rumahfais_eUfQ98EPm.png', 'Diproses', 3, 1, 10, 2, NULL, '2025-10-04', NULL, NULL, '2025-10-04 12:12:17', '2025-10-05 01:55:30', '68e10f6e5c7cd75eb8f7ed96'),
(28, 'makan', 'asfasdf', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1759580726715_rumahfais_D8qWRG668.png', 'Selesai', 3, 1, 11, 2, NULL, '2025-10-04', '2025-10-06', NULL, '2025-10-04 12:25:29', '2025-10-06 03:32:17', '68e112865c7cd75eb8099431'),
(31, 'rumah', 'rumah', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1761787619128_rumahfais_L7KnzPjRr.png', 'Diajukan', 3, NULL, 16, 2, NULL, '2025-10-30', NULL, NULL, '2025-10-30 01:27:01', '2025-10-30 06:22:15', '6902bf515c7cd75eb8f67b22'),
(32, 'Makan', 'makan', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762325998526_WhatsApp_Image_2025-11-05_at_08.14.51_kqRhh_-Zq.jpeg', 'Diproses', 3, 1, NULL, 2, 16, '2025-11-05', NULL, NULL, '2025-11-05 07:00:02', '2025-11-05 07:02:59', '690af6675c7cd75eb826a09e'),
(33, 'komputer error', 'eror', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762371062180_5f89492e-b9d7-4c2f-9931-a1da5b001300_M-rXptTgR.jpeg', 'Diajukan', 3, NULL, 27, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:31:04', '2025-11-05 19:31:04', '690ba66e5c7cd75eb83fa505'),
(34, 'komputer error', 'eror', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762371080612_5f89492e-b9d7-4c2f-9931-a1da5b001300_K5IUahN8V.jpeg', 'Diajukan', 3, NULL, 27, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:31:23', '2025-11-05 19:31:23', '690ba6815c7cd75eb8402ab3'),
(35, 'e', 'e', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762371720538_3a496338-6a2a-4909-a318-51f6e1c7ac07_wP9Uirpvo.jpeg', 'Diajukan', 3, NULL, 28, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:42:03', '2025-11-05 19:42:03', '690ba9025c7cd75eb85292fc'),
(36, 'e', 'e', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762371745931_3a496338-6a2a-4909-a318-51f6e1c7ac07_bxMUEN-6k.jpeg', 'Diajukan', 3, NULL, 28, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:42:27', '2025-11-05 19:42:27', '690ba91a5c7cd75eb8535145'),
(37, 'gg', 'ggg', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762371888994_39454844-d050-4dd7-ac86-e626d16629d6_9vev_jzss.jpeg', 'Diajukan', 3, NULL, 27, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:44:50', '2025-11-05 19:44:50', '690ba9a95c7cd75eb857b663'),
(38, 'vvvv', ' vvv', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762372219571_e41982cf-157a-4f64-8dd5-9071c827eeb0_aBP5yIeq5.jpeg', 'Diajukan', 3, NULL, 28, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:50:21', '2025-11-05 19:50:21', '690baaf45c7cd75eb861284a'),
(39, 'hcbnk', 'bgim', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762372528728_55ce7a02-2ae9-4b46-a814-7cbfa56b0e92_AK5JBLeWz.jpeg', 'Diajukan', 3, NULL, 28, 7, NULL, '2025-11-06', NULL, NULL, '2025-11-05 19:55:30', '2025-11-05 19:55:30', '690bac295c7cd75eb86a33f1'),
(40, 'meja', 'meja', NULL, 'Diajukan', 3, NULL, NULL, 11, 21, '2025-11-06', NULL, NULL, '2025-11-05 20:25:40', '2025-11-05 20:25:40', NULL),
(41, 'tes', 'tes', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762393896880_rumahfais_0YK8DoYyR.png', 'Diajukan', 3, NULL, 46, 11, NULL, '2025-11-06', NULL, 'Kamu jangan boong', '2025-11-06 01:51:38', '2025-11-06 04:14:36', '690bffa05c7cd75eb8f659cb'),
(42, 'hhhhhghg', 'gggggg', NULL, 'Selesai', 3, NULL, 27, 7, NULL, '2025-11-06', '2025-11-06', 'nice', '2025-11-06 04:30:05', '2025-11-06 05:56:58', NULL),
(43, 'tess aja', 'tes ajaa', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762406889281_cfc87cf9-fabd-4aff-9ed7-598dd1d70f76_HQ_DD_5dY.jpeg', 'Selesai', 3, NULL, 48, 10, NULL, '2025-11-06', '2025-11-06', 'ini udah done yahh', '2025-11-06 05:28:11', '2025-11-06 05:32:24', '690c32615c7cd75eb875969f'),
(44, 'HILANG', 'hahahah', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762409792925_d1833f33-c4f9-41e1-aff2-cbd6208eff9c_L1wQsrYqR.jpeg', 'Ditolak', 3, NULL, NULL, 10, 24, '2025-11-06', '2025-11-06', NULL, '2025-11-06 06:16:34', '2025-11-06 06:46:29', '690c3db95c7cd75eb8c95fb4'),
(45, 'Kehilangan ', 'belum tau juga', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762410573336_c30fe3dd-306b-43ab-8b6b-8a2fbda62691_yp_VI5Lpvm.jpeg', 'Diajukan', 3, NULL, NULL, 7, 25, '2025-11-06', NULL, NULL, '2025-11-06 06:29:35', '2025-11-06 06:29:35', '690c40c55c7cd75eb8dc84cc'),
(46, 'Meja guru hilang', 'meja guru di lab hilang', NULL, 'Diajukan', 3, NULL, NULL, 9, 26, '2025-11-06', NULL, NULL, '2025-11-06 06:45:45', '2025-11-06 06:45:45', NULL),
(47, 'Mumet', 'otak saya mengalami keruskan pak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762412576485_download_nXQl7p33o.jpg', 'Ditolak', 3, NULL, 10, 2, NULL, '2025-11-06', '2025-11-06', NULL, '2025-11-06 07:03:04', '2025-11-06 08:20:34', '690c489d5c7cd75eb81434e7'),
(48, 'Testing', 'Halo', NULL, 'Diproses', 3, NULL, 10, 2, NULL, '2025-11-06', NULL, 'diterima', '2025-11-06 08:25:18', '2025-11-07 02:43:10', NULL),
(49, 'Tugas', 'Tugas', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762483473807_download_tmgZIkK4H.jpg', 'Diajukan', 3, NULL, 10, 2, NULL, '2025-11-07', NULL, NULL, '2025-11-07 02:44:35', '2025-11-07 02:44:35', '690d5d8b5c7cd75eb81bbe91'),
(50, 'Tugas Halo', 'Tugas', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762483536588_download_TtX3DPF0_.jpg', 'Diajukan', 3, NULL, 10, 2, NULL, '2025-11-07', NULL, NULL, '2025-11-07 02:45:38', '2025-11-07 02:45:38', '690d5dca5c7cd75eb81d934b'),
(51, 'hdbdb', 'bxbxb', NULL, 'Diproses', 3, NULL, 48, 10, NULL, '2025-11-07', NULL, NULL, '2025-11-07 02:47:28', '2025-11-10 06:17:11', NULL),
(52, 'ndnd', 'jdnd', NULL, 'Diproses', 3, NULL, 50, 9, NULL, '2025-11-07', NULL, 'diacc', '2025-11-07 02:47:52', '2025-11-10 06:17:41', NULL),
(53, 'gelas pecah', 'gelas rusak', 'https://ik.imagekit.io/crazzy760/Pengaduan_Sarpras/Pengaduan/1762755864081_Screenshot_2025-05-26_095759_ubGzFCVhj.png', 'Diproses', 3, NULL, 34, 11, NULL, '2025-11-10', NULL, NULL, '2025-11-10 06:24:26', '2025-11-10 07:42:25', '691185965c7cd75eb841ed5d'),
(54, 'ssfsdf', 'sdfsf', NULL, 'Selesai', 3, 1, 50, 9, NULL, '2025-11-10', '2025-11-10', NULL, '2025-11-10 06:24:44', '2025-11-10 07:42:35', NULL),
(55, 'httttttttttt', 'sdfaf', NULL, 'Diajukan', 3, NULL, 53, 9, NULL, '2025-11-10', NULL, NULL, '2025-11-10 07:46:28', '2025-11-10 07:46:28', NULL),
(56, 'tes fcm', 'fasdf', NULL, 'Diajukan', 3, NULL, 36, 11, NULL, '2025-11-11', NULL, NULL, '2025-11-11 10:32:20', '2025-11-11 10:32:20', NULL),
(57, 'tes fcm', 'tess', NULL, 'Disetujui', 3, NULL, 52, 9, NULL, '2025-11-11', NULL, NULL, '2025-11-11 11:05:10', '2025-11-11 11:30:32', NULL),
(58, 'fdasdf', 'sdfasd', NULL, 'Diproses', 3, NULL, 38, 11, NULL, '2025-11-11', NULL, 'oke', '2025-11-11 11:05:46', '2025-11-11 11:06:41', NULL),
(59, 'halo', 'halo', NULL, 'Selesai', 3, NULL, NULL, 8, 28, '2025-11-11', '2025-11-11', NULL, '2025-11-11 11:31:56', '2025-11-11 13:35:51', NULL),
(60, 'asdfsd', 'sdfasdf', NULL, 'Selesai', 3, NULL, 53, 9, NULL, '2025-11-11', '2025-11-11', NULL, '2025-11-11 12:19:14', '2025-11-11 13:24:51', NULL),
(61, 'dsfsdf', 'dfasdf', NULL, 'Disetujui', 3, NULL, 52, 9, NULL, '2025-11-11', NULL, NULL, '2025-11-11 12:35:00', '2025-11-11 12:35:36', NULL),
(62, 'sdfsad', 'dfasd', NULL, 'Ditolak', 3, NULL, 40, 11, NULL, '2025-11-11', '2025-11-11', NULL, '2025-11-11 13:14:16', '2025-11-11 13:14:51', NULL),
(63, 'maul', 'maul', NULL, 'Disetujui', 3, NULL, 50, 9, NULL, '2025-11-12', NULL, NULL, '2025-11-12 03:16:14', '2025-11-12 03:24:03', NULL),
(64, 'fasdf', 'dsfasdf', NULL, 'Disetujui', 3, NULL, NULL, 13, 29, '2025-11-12', NULL, NULL, '2025-11-12 03:17:14', '2025-11-12 03:22:24', NULL),
(65, 'tes juga', 'tes juga', NULL, 'Disetujui', 3, NULL, NULL, 13, 30, '2025-11-12', NULL, 'masih nunggu acc dari admin', '2025-11-12 03:25:47', '2025-11-12 03:33:16', NULL),
(66, 'tes', 'tes', NULL, 'Diproses', 3, NULL, NULL, 8, 31, '2025-11-12', NULL, NULL, '2025-11-12 05:13:32', '2025-11-12 05:15:54', NULL),
(67, 'ee gatau juga', 'halo', NULL, 'Diproses', 3, NULL, NULL, 8, 32, '2025-11-12', NULL, NULL, '2025-11-12 13:09:15', '2025-11-12 13:09:36', NULL);

--
-- Triggers `pengaduan_sarpras_pengaduan`
--
DELIMITER $$
CREATE TRIGGER `setTglSelesaiPengaduan` BEFORE UPDATE ON `pengaduan_sarpras_pengaduan` FOR EACH ROW BEGIN
  IF (NEW.status = 'Selesai' AND OLD.status <> 'Selesai')
     OR (NEW.status = 'Ditolak' AND OLD.status <> 'Ditolak') THEN
    SET NEW.tgl_selesai = NOW();
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `validatePengaduan` BEFORE INSERT ON `pengaduan_sarpras_pengaduan` FOR EACH ROW BEGIN
  DECLARE report_count INT;

  SELECT COUNT(*) INTO report_count
  FROM pengaduan_sarpras_pengaduan
  WHERE id_lokasi = NEW.id_lokasi
    AND id_item = NEW.id_item
    AND status = 'Disetujui'
    AND tgl_pengajuan >= DATE_SUB(CURDATE(), INTERVAL 2 DAY);

  IF report_count >= 2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pengaduan untuk item ini sudah disetujui dalam 2 hari terakhir.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_petugas`
--

CREATE TABLE `pengaduan_sarpras_petugas` (
  `id_petugas` int NOT NULL,
  `nama` varchar(200) NOT NULL,
  `gender` enum('P','L') NOT NULL,
  `telp` varchar(30) DEFAULT NULL,
  `id_user` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_petugas`
--

INSERT INTO `pengaduan_sarpras_petugas` (`id_petugas`, `nama`, `gender`, `telp`, `id_user`) VALUES
(1, 'Ridwan Kamil', 'L', '08123456789', 4),
(2, 'Kamil', 'L', '08123456789', 6);

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_riwayat_aksi`
--

CREATE TABLE `pengaduan_sarpras_riwayat_aksi` (
  `id_riwayat` int NOT NULL,
  `id_pengaduan` int NOT NULL,
  `id_petugas` int DEFAULT NULL COMMENT 'NULL jika aksi dilakukan oleh admin',
  `id_user` int NOT NULL COMMENT 'User yang melakukan aksi (petugas atau admin)',
  `role_user` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Role: petugas atau admin',
  `aksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Deskripsi aksi yang dilakukan',
  `status_sebelumnya` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status sebelum diubah',
  `status_baru` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Status setelah diubah',
  `saran_petugas` text COLLATE utf8mb4_unicode_ci COMMENT 'Saran dari petugas',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu aksi dilakukan'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel riwayat aksi petugas/admin terhadap pengaduan';

--
-- Dumping data for table `pengaduan_sarpras_riwayat_aksi`
--

INSERT INTO `pengaduan_sarpras_riwayat_aksi` (`id_riwayat`, `id_pengaduan`, `id_petugas`, `id_user`, `role_user`, `aksi`, `status_sebelumnya`, `status_baru`, `saran_petugas`, `created_at`) VALUES
(5, 52, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', 'diacc', '2025-11-09 11:29:45'),
(6, 51, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', '', '2025-11-10 06:17:11'),
(7, 52, NULL, 1, 'admin', 'Update Status ke Diajukan', 'Diproses', 'Diajukan', 'diacc', '2025-11-10 06:17:35'),
(8, 52, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', 'diacc', '2025-11-10 06:17:41'),
(9, 54, 1, 4, 'petugas', 'Update Status ke Diajukan', 'Diajukan', 'Diajukan', '', '2025-11-10 06:30:16'),
(10, 54, 1, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-10 07:27:28'),
(11, 53, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', '', '2025-11-10 07:42:25'),
(12, 54, 1, 1, 'admin', 'Update Status ke Selesai', 'Disetujui', 'Selesai', '', '2025-11-10 07:42:35'),
(13, 58, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', 'oke', '2025-11-11 11:06:41'),
(14, 57, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-11 11:30:32'),
(15, 61, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-11 12:35:36'),
(16, 60, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', '', '2025-11-11 12:45:54'),
(17, 62, NULL, 1, 'admin', 'Update Status ke Ditolak', 'Diajukan', 'Ditolak', '', '2025-11-11 13:14:51'),
(18, 60, NULL, 1, 'admin', 'Update Status ke Selesai', 'Diproses', 'Selesai', '', '2025-11-11 13:24:51'),
(19, 59, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-11 13:34:50'),
(20, 59, NULL, 1, 'admin', 'Update Status ke Selesai', 'Disetujui', 'Selesai', '', '2025-11-11 13:35:51'),
(21, 64, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-12 03:22:24'),
(22, 63, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-12 03:24:03'),
(23, 65, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', 'masih nunggu acc dari admin', '2025-11-12 03:33:16'),
(24, 66, NULL, 1, 'admin', 'Update Status ke Disetujui', 'Diajukan', 'Disetujui', '', '2025-11-12 05:15:01'),
(25, 66, NULL, 1, 'admin', 'Update Status ke Diproses', 'Disetujui', 'Diproses', '', '2025-11-12 05:15:54'),
(26, 67, NULL, 1, 'admin', 'Update Status ke Diproses', 'Diajukan', 'Diproses', '', '2025-11-12 13:09:36');

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_temporary_item`
--

CREATE TABLE `pengaduan_sarpras_temporary_item` (
  `id_temporary` int NOT NULL,
  `nama_barang_baru` varchar(100) NOT NULL,
  `id_item` int DEFAULT NULL,
  `id_lokasi` int DEFAULT NULL,
  `status` enum('Diproses','Disetujui','Ditolak') DEFAULT 'Diproses',
  `nama_admin` int DEFAULT NULL,
  `tanggal` datetime DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_temporary_item`
--

INSERT INTO `pengaduan_sarpras_temporary_item` (`id_temporary`, `nama_barang_baru`, `id_item`, `id_lokasi`, `status`, `nama_admin`, `tanggal`, `approved_by`, `approved_at`) VALUES
(15, 'Rumah', NULL, 2, 'Disetujui', NULL, NULL, NULL, NULL),
(16, 'makna', NULL, 2, 'Diproses', NULL, NULL, NULL, NULL),
(17, 'Mouse', NULL, 7, 'Diproses', NULL, NULL, NULL, NULL),
(18, 'Mouse', NULL, 7, 'Diproses', NULL, NULL, NULL, NULL),
(19, 'mouse', NULL, 7, 'Diproses', NULL, NULL, NULL, NULL),
(20, 'kursi', NULL, 10, 'Diproses', NULL, NULL, NULL, NULL),
(21, 'meja', NULL, 11, 'Diproses', NULL, NULL, NULL, NULL),
(22, 'meja', NULL, 11, 'Disetujui', NULL, NULL, 1, '2025-11-06 11:14:36'),
(23, 'hello', NULL, 10, 'Disetujui', NULL, NULL, 1, '2025-11-06 12:32:24'),
(24, 'MULYATNO', NULL, 10, 'Diproses', NULL, NULL, NULL, NULL),
(25, 'manusia', NULL, 7, 'Diproses', NULL, NULL, NULL, NULL),
(26, 'Meja', NULL, 9, 'Diproses', NULL, NULL, NULL, NULL),
(27, 'gelas', NULL, 9, 'Disetujui', NULL, NULL, 1, '2025-11-07 09:48:12'),
(28, 'fasdf', NULL, 8, 'Diproses', NULL, NULL, NULL, NULL),
(29, 'hjfkh', NULL, 13, 'Diproses', NULL, NULL, NULL, NULL),
(30, 'tes aja', NULL, 13, 'Diproses', NULL, NULL, NULL, NULL),
(31, 'tes', NULL, 8, 'Diproses', NULL, NULL, NULL, NULL),
(32, 'cilla', NULL, 8, 'Diproses', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pengaduan_sarpras_user`
--

CREATE TABLE `pengaduan_sarpras_user` (
  `id_user` int NOT NULL,
  `username` varchar(200) NOT NULL,
  `password` varchar(200) NOT NULL,
  `nama_pengguna` varchar(200) DEFAULT NULL,
  `role` enum('admin','petugas','pengguna') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pengaduan_sarpras_user`
--

INSERT INTO `pengaduan_sarpras_user` (`id_user`, `username`, `password`, `nama_pengguna`, `role`) VALUES
(1, 'farel', '$2a$12$wpr8S6Ssgfrdwg0Gv2buBupHhbf5xCVGoLv/KM3KyLnysgbduBiAG', 'Farel Haryanto', 'admin'),
(3, 'cilla', '$2b$10$saSLjIBkkiE5JCrbkQh/bedPl6raEnAMryH.Z4z9XMGWI1kYrbZmK', 'Parell', 'pengguna'),
(4, 'ridwan', '$2b$10$F2griNeixEQYFl3bkq9jneHgGKVyNpapCwqBszDumFbMIXC/rrWdO', 'Petugas Sarpras', 'petugas'),
(5, 'kepek', '$2b$10$e.LuBQ6H4xbbTCiWjUo5BOkBFUqAzeNIeH6OkPTh9rnvN5InitXiy', 'Kepek', 'pengguna'),
(6, 'kamil', '$2b$10$ZPcGSbTzW6uYF7UM/ff/L.q52ZLBRE5XGbLaSipmJBCqVrlzywK0C', 'Petugas Sarpras', 'petugas'),
(7, 'Maskupin', '$2b$10$C7LaIrFCUPCioBnIe0NT3Ox7exNZrzhygMfDjW4.0LMshpzQ13zm.', 'Kepek', 'pengguna'),
(8, 'maula', '$2b$10$v4DCMaj5bOGqseTawz7zdetAY16b//WgRqisqFzerZEW1ZIwyIPvy', 'Maula Ahmada', 'pengguna'),
(9, 'makan', '$2b$10$z3pENnB96xl4Z5OfnMsufO32zxwgvbovSG8WtsU7smf./lt5mchD6', 'makan', 'pengguna'),
(10, 'hilo', '$2b$10$f8m2ZqVICIVqD0h1giJtKetJpSuHYL4SSzjHDogBdE2j8iKH/AMxK', 'hilo', 'pengguna'),
(11, 'ninja', '$2b$10$IkPTKTbinQTcY5EurPxOJOmbAtg2l5Jv8vuogN33drSo/XGz3H3D2', 'Ninja', 'pengguna'),
(12, 'nathan', '$2b$10$PE4ssCCUUXaZeKiSS.HApOdXA5AsSQ8e08jLqVUhmspgmg0d96L5O', 'tama', 'pengguna');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notification_history`
--
ALTER TABLE `notification_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sent_at` (`sent_at`),
  ADD KEY `idx_user_is_read` (`user_id`,`is_read`);

--
-- Indexes for table `pengaduan_sarpras_items`
--
ALTER TABLE `pengaduan_sarpras_items`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `id_lokasi` (`id_lokasi`);

--
-- Indexes for table `pengaduan_sarpras_kategori_lokasi`
--
ALTER TABLE `pengaduan_sarpras_kategori_lokasi`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `pengaduan_sarpras_lokasi`
--
ALTER TABLE `pengaduan_sarpras_lokasi`
  ADD PRIMARY KEY (`id_lokasi`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indexes for table `pengaduan_sarpras_pengaduan`
--
ALTER TABLE `pengaduan_sarpras_pengaduan`
  ADD PRIMARY KEY (`id_pengaduan`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_petugas` (`id_petugas`),
  ADD KEY `id_item` (`id_item`),
  ADD KEY `id_lokasi` (`id_lokasi`),
  ADD KEY `fk_pengaduan_temp` (`id_temporary`);

--
-- Indexes for table `pengaduan_sarpras_petugas`
--
ALTER TABLE `pengaduan_sarpras_petugas`
  ADD PRIMARY KEY (`id_petugas`),
  ADD UNIQUE KEY `id_user` (`id_user`);

--
-- Indexes for table `pengaduan_sarpras_riwayat_aksi`
--
ALTER TABLE `pengaduan_sarpras_riwayat_aksi`
  ADD PRIMARY KEY (`id_riwayat`),
  ADD KEY `fk_riwayat_user` (`id_user`),
  ADD KEY `idx_pengaduan` (`id_pengaduan`),
  ADD KEY `idx_petugas` (`id_petugas`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status_baru` (`status_baru`),
  ADD KEY `idx_role_user` (`role_user`);

--
-- Indexes for table `pengaduan_sarpras_temporary_item`
--
ALTER TABLE `pengaduan_sarpras_temporary_item`
  ADD PRIMARY KEY (`id_temporary`),
  ADD KEY `id_lokasi` (`id_lokasi`),
  ADD KEY `fk_temp_item` (`id_item`);

--
-- Indexes for table `pengaduan_sarpras_user`
--
ALTER TABLE `pengaduan_sarpras_user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notification_history`
--
ALTER TABLE `notification_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_items`
--
ALTER TABLE `pengaduan_sarpras_items`
  MODIFY `id_item` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_kategori_lokasi`
--
ALTER TABLE `pengaduan_sarpras_kategori_lokasi`
  MODIFY `id_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_lokasi`
--
ALTER TABLE `pengaduan_sarpras_lokasi`
  MODIFY `id_lokasi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_pengaduan`
--
ALTER TABLE `pengaduan_sarpras_pengaduan`
  MODIFY `id_pengaduan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_petugas`
--
ALTER TABLE `pengaduan_sarpras_petugas`
  MODIFY `id_petugas` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_riwayat_aksi`
--
ALTER TABLE `pengaduan_sarpras_riwayat_aksi`
  MODIFY `id_riwayat` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_temporary_item`
--
ALTER TABLE `pengaduan_sarpras_temporary_item`
  MODIFY `id_temporary` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `pengaduan_sarpras_user`
--
ALTER TABLE `pengaduan_sarpras_user`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notification_history`
--
ALTER TABLE `notification_history`
  ADD CONSTRAINT `notification_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `pengaduan_sarpras_user` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `pengaduan_sarpras_items`
--
ALTER TABLE `pengaduan_sarpras_items`
  ADD CONSTRAINT `pengaduan_sarpras_items_ibfk_1` FOREIGN KEY (`id_lokasi`) REFERENCES `pengaduan_sarpras_lokasi` (`id_lokasi`) ON DELETE CASCADE;

--
-- Constraints for table `pengaduan_sarpras_lokasi`
--
ALTER TABLE `pengaduan_sarpras_lokasi`
  ADD CONSTRAINT `pengaduan_sarpras_lokasi_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `pengaduan_sarpras_kategori_lokasi` (`id_kategori`);

--
-- Constraints for table `pengaduan_sarpras_pengaduan`
--
ALTER TABLE `pengaduan_sarpras_pengaduan`
  ADD CONSTRAINT `fk_pengaduan_temp` FOREIGN KEY (`id_temporary`) REFERENCES `pengaduan_sarpras_temporary_item` (`id_temporary`) ON DELETE SET NULL,
  ADD CONSTRAINT `pengaduan_sarpras_pengaduan_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `pengaduan_sarpras_user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengaduan_sarpras_pengaduan_ibfk_2` FOREIGN KEY (`id_petugas`) REFERENCES `pengaduan_sarpras_petugas` (`id_petugas`) ON DELETE SET NULL,
  ADD CONSTRAINT `pengaduan_sarpras_pengaduan_ibfk_3` FOREIGN KEY (`id_item`) REFERENCES `pengaduan_sarpras_items` (`id_item`) ON DELETE SET NULL,
  ADD CONSTRAINT `pengaduan_sarpras_pengaduan_ibfk_4` FOREIGN KEY (`id_lokasi`) REFERENCES `pengaduan_sarpras_lokasi` (`id_lokasi`) ON DELETE CASCADE;

--
-- Constraints for table `pengaduan_sarpras_petugas`
--
ALTER TABLE `pengaduan_sarpras_petugas`
  ADD CONSTRAINT `pengaduan_sarpras_petugas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `pengaduan_sarpras_user` (`id_user`);

--
-- Constraints for table `pengaduan_sarpras_riwayat_aksi`
--
ALTER TABLE `pengaduan_sarpras_riwayat_aksi`
  ADD CONSTRAINT `fk_riwayat_pengaduan` FOREIGN KEY (`id_pengaduan`) REFERENCES `pengaduan_sarpras_pengaduan` (`id_pengaduan`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_riwayat_petugas` FOREIGN KEY (`id_petugas`) REFERENCES `pengaduan_sarpras_petugas` (`id_petugas`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_riwayat_user` FOREIGN KEY (`id_user`) REFERENCES `pengaduan_sarpras_user` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `pengaduan_sarpras_temporary_item`
--
ALTER TABLE `pengaduan_sarpras_temporary_item`
  ADD CONSTRAINT `fk_temp_item` FOREIGN KEY (`id_item`) REFERENCES `pengaduan_sarpras_items` (`id_item`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pengaduan_sarpras_temporary_item_ibfk_1` FOREIGN KEY (`id_lokasi`) REFERENCES `pengaduan_sarpras_lokasi` (`id_lokasi`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
