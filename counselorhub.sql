-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 10, 2025 at 07:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `counselorhub`
--

-- --------------------------------------------------------

--
-- Table structure for table `behavior_records`
--

CREATE TABLE `behavior_records` (
  `record_id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `reporter_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `behavior_type` enum('positive','negative') NOT NULL,
  `description` text NOT NULL,
  `severity` enum('positive','neutral','minor','major') NOT NULL,
  `category` varchar(50) DEFAULT NULL COMMENT 'attendance, discipline, participation, social',
  `action_taken` text DEFAULT NULL,
  `follow_up_required` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `behavior_records`
--

INSERT INTO `behavior_records` (`record_id`, `student_id`, `reporter_id`, `date`, `behavior_type`, `description`, `severity`, `category`, `action_taken`, `follow_up_required`, `is_active`, `created_at`, `updated_at`) VALUES
('behavior-20250603-055632-1103250036', '1103250036', 'ADM-2025-001', '2025-06-01 17:00:00', 'negative', 'gfhgf', 'minor', 'attendance', 'ggjghj', 0, 1, '2025-06-02 22:56:32', '2025-06-02 22:56:32'),
('behavior-20250603-173832-1103220016', '1103220016', 'ADM-2025-001', '2025-06-02 17:00:00', 'positive', 'fgdfgsd', 'positive', 'participation', 'fdgdfgersz', 0, 1, '2025-06-03 10:38:32', '2025-06-03 10:38:32'),
('behavior-20250610-094948-1103250006', '1103250006', 'ADM-2025-001', '2025-06-09 17:00:00', 'positive', 'vcbfcc', 'positive', 'attendance', 'fdgdgdf', 0, 1, '2025-06-10 02:49:48', '2025-06-10 02:54:05'),
('behavior-20250610-095344-1103250039', '1103250039', 'KSL-2025-004', '2025-06-09 17:00:00', 'negative', 'xcv', 'minor', 'participation', 'cxvxvcx', 0, 1, '2025-06-10 02:53:44', '2025-06-10 02:53:44');

-- --------------------------------------------------------

--
-- Table structure for table `career_assessments`
--

CREATE TABLE `career_assessments` (
  `assessment_id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `assessment_type` varchar(50) NOT NULL COMMENT 'mbti, riasec, holland',
  `interests` text DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `values_data` text DEFAULT NULL,
  `recommended_paths` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `results` text DEFAULT NULL COMMENT 'Detailed assessment results as JSON string',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `career_assessments`
--

INSERT INTO `career_assessments` (`assessment_id`, `student_id`, `date`, `assessment_type`, `interests`, `skills`, `values_data`, `recommended_paths`, `notes`, `results`, `is_active`, `created_at`, `updated_at`) VALUES
('mbti-1748921831-1103220016', '1103220016', '2025-06-03 03:37:11', 'mbti', 'INFP', '', '', 'Writer,Counselor,Artist', 'MBTI Assessment - User: Pandu Kaya Hakiki', '{\"type\": \"INFP\", \"scores\": {\"EI\": 53, \"SN\": 53, \"TF\": 53, \"JP\": 53}, \"strengths\": [\"Empathetic\", \"Creative\", \"Open-minded\", \"Passionate\", \"Dedicated\"], \"weaknesses\": [\"Impractical\", \"Emotionally vulnerable\", \"Self-isolating\", \"Unrealistic expectations\", \"Takes things personally\"], \"careerSuggestions\": [\"Writer\", \"Counselor\", \"Artist\", \"Social Worker\", \"UX Designer\"], \"learningStyle\": \"Personalized learning that aligns with values. Prefers creative expression and working at their own pace.\", \"compatibleTypes\": [\"ENFJ\", \"ENTJ\", \"ESFJ\", \"ESTJ\"]}', 1, '2025-06-03 03:37:11', '2025-06-03 03:37:11'),
('riasec-1748921916-1103220016', '1103220016', '2025-06-03 03:38:36', 'riasec', 'investigative,artistic,social', '', '', 'Teacher,Accountant,Psychologist', 'RIASEC Assessment - User: Pandu Kaya Hakiki', '{\"realistic\": 84, \"investigative\": 100, \"artistic\": 100, \"social\": 100, \"enterprising\": 98, \"conventional\": 100, \"timestamp\": \"2025-06-03T03:38:36.079Z\", \"topCategories\": [\"investigative\", \"artistic\", \"social\"], \"recommendedCareers\": [{\"title\": \"Teacher\", \"description\": \"Mendidik siswa dalam berbagai mata pelajaran dan tingkatan.\", \"primaryCategories\": [\"social\", \"artistic\"], \"categories\": [\"social\", \"artistic\", \"conventional\"], \"educationRequired\": \"Sarjana Pendidikan\", \"salary\": {\"min\": 3500000, \"max\": 10000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 4, \"match\": 100}, {\"title\": \"Accountant\", \"description\": \"Menyiapkan dan memeriksa catatan keuangan, memastikan akurasi dan kepatuhan pada hukum.\", \"primaryCategories\": [\"conventional\", \"investigative\"], \"categories\": [\"conventional\", \"investigative\", \"enterprising\"], \"educationRequired\": \"Sarjana Akuntansi\", \"salary\": {\"min\": 7000000, \"max\": 18000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 7, \"match\": 100}, {\"title\": \"Psychologist\", \"description\": \"Meneliti perilaku manusia dan proses mental, serta memberikan terapi untuk masalah psikologis.\", \"primaryCategories\": [\"investigative\", \"social\"], \"categories\": [\"investigative\", \"social\", \"artistic\"], \"educationRequired\": \"Master atau Doktor Psikologi\", \"salary\": {\"min\": 8000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 14, \"match\": 100}, {\"title\": \"Financial Analyst\", \"description\": \"Menganalisis data keuangan untuk membantu perusahaan membuat keputusan bisnis.\", \"primaryCategories\": [\"conventional\", \"investigative\"], \"categories\": [\"conventional\", \"investigative\", \"enterprising\"], \"educationRequired\": \"Sarjana Keuangan, Ekonomi, atau Statistik\", \"salary\": {\"min\": 8000000, \"max\": 20000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 11, \"match\": 100}, {\"title\": \"Marketing Manager\", \"description\": \"Mengembangkan dan melaksanakan strategi pemasaran untuk produk atau layanan.\", \"primaryCategories\": [\"enterprising\", \"social\"], \"categories\": [\"enterprising\", \"social\", \"conventional\"], \"educationRequired\": \"Sarjana Pemasaran, Komunikasi, atau Bisnis\", \"salary\": {\"min\": 10000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 10, \"match\": 99}, {\"title\": \"Event Planner\", \"description\": \"Mengatur dan mengkoordinasikan acara profesional, pribadi, atau sosial.\", \"primaryCategories\": [\"enterprising\", \"social\"], \"categories\": [\"enterprising\", \"social\", \"artistic\"], \"educationRequired\": \"Diploma/Sarjana Event Management atau bidang terkait\", \"salary\": {\"min\": 5000000, \"max\": 15000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 8, \"match\": 99}, {\"title\": \"Interior Designer\", \"description\": \"Merancang dan mendekorasi ruangan dalam bangunan untuk memenuhi kebutuhan fungsional dan estetika.\", \"primaryCategories\": [\"artistic\", \"enterprising\"], \"categories\": [\"artistic\", \"enterprising\", \"realistic\"], \"educationRequired\": \"Sarjana Desain Interior\", \"salary\": {\"min\": 6000000, \"max\": 18000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 5, \"match\": 96}, {\"title\": \"Software Engineer\", \"description\": \"Merancang, mengembangkan, dan memelihara aplikasi perangkat lunak.\", \"primaryCategories\": [\"investigative\", \"realistic\", \"conventional\"], \"categories\": [\"investigative\", \"realistic\", \"conventional\"], \"educationRequired\": \"Sarjana Ilmu Komputer atau bidang terkait\", \"salary\": {\"min\": 8000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 22, \"match\": 95}, {\"title\": \"Civil Engineer\", \"description\": \"Merancang, membangun, dan memelihara infrastruktur seperti jalan, jembatan, dan gedung.\", \"primaryCategories\": [\"realistic\", \"investigative\"], \"categories\": [\"realistic\", \"investigative\", \"conventional\"], \"educationRequired\": \"Sarjana Teknik Sipil\", \"salary\": {\"min\": 7500000, \"max\": 20000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 8, \"match\": 94}, {\"title\": \"Graphic Designer\", \"description\": \"Membuat elemen visual untuk mengkomunikasikan ide kepada konsumen.\", \"primaryCategories\": [\"artistic\", \"realistic\"], \"categories\": [\"artistic\", \"realistic\", \"enterprising\"], \"educationRequired\": \"Diploma/Sarjana Desain Grafis atau bidang terkait\", \"salary\": {\"min\": 5000000, \"max\": 15000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 3, \"match\": 93}]}', 1, '2025-06-03 03:38:36', '2025-06-03 03:38:36'),
('riasec-1748934647-1103220016', '1103220016', '2025-06-03 07:10:47', 'riasec', 'realistic,investigative,artistic', '', '', 'Civil Engineer,Software Engineer,Graphic Designer', 'RIASEC Assessment - User: Pandu Kaya Hakiki', '{\"realistic\": 100, \"investigative\": 100, \"artistic\": 64, \"social\": 60, \"enterprising\": 62, \"conventional\": 60, \"timestamp\": \"2025-06-03T07:10:47.192Z\", \"topCategories\": [\"realistic\", \"investigative\", \"artistic\"], \"recommendedCareers\": [{\"title\": \"Civil Engineer\", \"description\": \"Merancang, membangun, dan memelihara infrastruktur seperti jalan, jembatan, dan gedung.\", \"primaryCategories\": [\"realistic\", \"investigative\"], \"categories\": [\"realistic\", \"investigative\", \"conventional\"], \"educationRequired\": \"Sarjana Teknik Sipil\", \"salary\": {\"min\": 7500000, \"max\": 20000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 8, \"match\": 92}, {\"title\": \"Software Engineer\", \"description\": \"Merancang, mengembangkan, dan memelihara aplikasi perangkat lunak.\", \"primaryCategories\": [\"investigative\", \"realistic\", \"conventional\"], \"categories\": [\"investigative\", \"realistic\", \"conventional\"], \"educationRequired\": \"Sarjana Ilmu Komputer atau bidang terkait\", \"salary\": {\"min\": 8000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 22, \"match\": 87}, {\"title\": \"Graphic Designer\", \"description\": \"Membuat elemen visual untuk mengkomunikasikan ide kepada konsumen.\", \"primaryCategories\": [\"artistic\", \"realistic\"], \"categories\": [\"artistic\", \"realistic\", \"enterprising\"], \"educationRequired\": \"Diploma/Sarjana Desain Grafis atau bidang terkait\", \"salary\": {\"min\": 5000000, \"max\": 15000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 3, \"match\": 78}, {\"title\": \"Psychologist\", \"description\": \"Meneliti perilaku manusia dan proses mental, serta memberikan terapi untuk masalah psikologis.\", \"primaryCategories\": [\"investigative\", \"social\"], \"categories\": [\"investigative\", \"social\", \"artistic\"], \"educationRequired\": \"Master atau Doktor Psikologi\", \"salary\": {\"min\": 8000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 14, \"match\": 77}, {\"title\": \"Accountant\", \"description\": \"Menyiapkan dan memeriksa catatan keuangan, memastikan akurasi dan kepatuhan pada hukum.\", \"primaryCategories\": [\"conventional\", \"investigative\"], \"categories\": [\"conventional\", \"investigative\", \"enterprising\"], \"educationRequired\": \"Sarjana Akuntansi\", \"salary\": {\"min\": 7000000, \"max\": 18000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 7, \"match\": 76}, {\"title\": \"Financial Analyst\", \"description\": \"Menganalisis data keuangan untuk membantu perusahaan membuat keputusan bisnis.\", \"primaryCategories\": [\"conventional\", \"investigative\"], \"categories\": [\"conventional\", \"investigative\", \"enterprising\"], \"educationRequired\": \"Sarjana Keuangan, Ekonomi, atau Statistik\", \"salary\": {\"min\": 8000000, \"max\": 20000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 11, \"match\": 76}, {\"title\": \"Interior Designer\", \"description\": \"Merancang dan mendekorasi ruangan dalam bangunan untuk memenuhi kebutuhan fungsional dan estetika.\", \"primaryCategories\": [\"artistic\", \"enterprising\"], \"categories\": [\"artistic\", \"enterprising\", \"realistic\"], \"educationRequired\": \"Sarjana Desain Interior\", \"salary\": {\"min\": 6000000, \"max\": 18000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 5, \"match\": 70}, {\"title\": \"Teacher\", \"description\": \"Mendidik siswa dalam berbagai mata pelajaran dan tingkatan.\", \"primaryCategories\": [\"social\", \"artistic\"], \"categories\": [\"social\", \"artistic\", \"conventional\"], \"educationRequired\": \"Sarjana Pendidikan\", \"salary\": {\"min\": 3500000, \"max\": 10000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 4, \"match\": 62}, {\"title\": \"Event Planner\", \"description\": \"Mengatur dan mengkoordinasikan acara profesional, pribadi, atau sosial.\", \"primaryCategories\": [\"enterprising\", \"social\"], \"categories\": [\"enterprising\", \"social\", \"artistic\"], \"educationRequired\": \"Diploma/Sarjana Event Management atau bidang terkait\", \"salary\": {\"min\": 5000000, \"max\": 15000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 8, \"match\": 62}, {\"title\": \"Marketing Manager\", \"description\": \"Mengembangkan dan melaksanakan strategi pemasaran untuk produk atau layanan.\", \"primaryCategories\": [\"enterprising\", \"social\"], \"categories\": [\"enterprising\", \"social\", \"conventional\"], \"educationRequired\": \"Sarjana Pemasaran, Komunikasi, atau Bisnis\", \"salary\": {\"min\": 10000000, \"max\": 25000000, \"currency\": \"IDR\"}, \"outlookGrowth\": 10, \"match\": 61}]}', 1, '2025-06-03 07:10:47', '2025-06-03 07:10:47');

-- --------------------------------------------------------

--
-- Table structure for table `career_resources`
--

CREATE TABLE `career_resources` (
  `resource_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `resource_type` varchar(50) NOT NULL COMMENT 'article, video, assessment, etc.',
  `url` varchar(500) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `date_published` timestamp NULL DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `class_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade_level` varchar(10) NOT NULL,
  `student_count` int(11) DEFAULT 0,
  `academic_year` varchar(10) NOT NULL,
  `teacher_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`class_id`, `name`, `grade_level`, `student_count`, `academic_year`, `teacher_name`, `is_active`, `created_at`, `updated_at`) VALUES
('CLS001', 'A', '10', 25, '2024-2025', 'Mrs. Anderson', 1, '2025-06-01 23:55:19', '2025-06-01 23:55:19'),
('CLS002', 'B', '10', 24, '2024-2025', 'Mr. Thompson', 1, '2025-06-01 23:55:19', '2025-06-01 23:55:19'),
('CLS003', 'A', '11', 23, '2024-2025', 'Dr. Roberts', 1, '2025-06-01 23:55:19', '2025-06-01 23:55:19'),
('CLS004', 'B', '11', 22, '2024-2025', 'Ms. Wilson', 1, '2025-06-01 23:55:19', '2025-06-01 23:55:19'),
('CLS005', 'A', '12', 21, '2024-2025', 'Mr. Davis', 1, '2025-06-01 23:55:19', '2025-06-01 23:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `counseling_sessions`
--

CREATE TABLE `counseling_sessions` (
  `session_id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `counselor_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `notes` text DEFAULT NULL,
  `session_type` enum('academic','behavioral','mental-health','career','social') NOT NULL,
  `outcome` enum('positive','neutral','negative') NOT NULL,
  `next_steps` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` varchar(50) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `follow_up` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `counseling_sessions`
--

INSERT INTO `counseling_sessions` (`session_id`, `student_id`, `counselor_id`, `date`, `duration`, `notes`, `session_type`, `outcome`, `next_steps`, `is_active`, `created_at`, `updated_at`, `approval_status`, `approved_by`, `approved_at`, `rejection_reason`, `follow_up`) VALUES
('CS-20250602-141251-1103220016', '1103220016', 'KSL-2025-001', '2025-06-03 04:01:18', 60, 'fdffd', 'career', 'neutral', '', 1, '2025-06-02 07:12:51', '2025-06-03 04:01:18', 'approved', 'KSL-2025-001', '2025-06-03 04:01:18', NULL, NULL),
('CS-20250603-063157-1103220016', '1103220016', 'KSL-2025-001', '2025-06-03 04:01:57', 60, 'v ', 'academic', 'neutral', '', 1, '2025-06-02 23:31:57', '2025-06-03 04:01:57', 'rejected', 'KSL-2025-001', '2025-06-03 04:01:57', 'tidak jelas', NULL),
('CS-20250603-190201-1103220016', '1103220016', 'KSL-2025-001', '2025-06-03 12:03:36', 60, 'hhdjdns', 'academic', 'neutral', '', 0, '2025-06-03 12:02:01', '2025-06-03 12:03:36', 'pending', NULL, NULL, NULL, NULL),
('CS-20250603-190404-1103220016', '1103220016', 'KSL-2025-001', '2025-06-03 12:15:08', 60, 'hshsis', 'academic', 'neutral', '', 1, '2025-06-03 12:04:04', '2025-06-03 12:15:08', 'approved', 'KSL-2025-001', '2025-06-03 12:15:08', NULL, NULL),
('CS-20250603-202907-1103220016', '1103220016', 'KSL-2025-001', '2025-06-03 13:29:19', 60, 'yshshs', 'mental-health', 'neutral', 'hshsbsbs', 1, '2025-06-03 13:29:07', '2025-06-03 13:29:19', 'rejected', 'KSL-2025-001', '2025-06-03 13:29:19', 'shwbwjjajama', NULL),
('CS-20250603-204305-1103250036', '1103250036', 'KSL-2025-001', '2025-06-03 13:43:10', 60, 'hfxvc', 'behavioral', 'neutral', '', 1, '2025-06-03 13:43:05', '2025-06-03 13:43:10', 'approved', 'KSL-2025-001', '2025-06-03 13:43:10', NULL, NULL),
('CS-20250610-100336-1103250039', '1103250039', 'KSL-2025-004', '2025-06-10 03:03:46', 60, 'cbcvbcv', 'career', 'neutral', '', 1, '2025-06-10 03:03:36', '2025-06-10 03:03:46', 'approved', 'KSL-2025-004', '2025-06-10 03:03:46', NULL, NULL),
('CS-20250610-100405-1103250005', '1103250005', 'KSL-2025-004', '2025-06-10 03:04:12', 60, 'vcbcvbvnvgnvb', 'social', 'neutral', '', 1, '2025-06-10 03:04:05', '2025-06-10 03:04:12', 'approved', 'KSL-2025-004', '2025-06-10 03:04:12', NULL, NULL),
('CS-20250610-100558-1103250023', '1103250023', 'KSL-2025-004', '2025-06-10 03:06:06', 60, 'fbfgdgfdf', 'academic', 'neutral', '', 1, '2025-06-10 03:05:58', '2025-06-10 03:06:06', 'approved', 'KSL-2025-004', '2025-06-10 03:06:06', NULL, NULL),
('CS-20250610-100851-1103250002', '1103250002', 'KSL-2025-004', '2025-06-10 03:08:57', 60, 'dfgdf', 'mental-health', 'neutral', '', 1, '2025-06-10 03:08:51', '2025-06-10 03:08:57', 'approved', 'KSL-2025-004', '2025-06-10 03:08:57', NULL, NULL),
('CS-20250610-100921-1103250015', '1103250015', 'KSL-2025-004', '2025-06-10 03:09:26', 60, 'dsfdsfd', 'behavioral', 'neutral', '', 1, '2025-06-10 03:09:21', '2025-06-10 03:09:26', 'approved', 'KSL-2025-004', '2025-06-10 03:09:26', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `mental_health_assessments`
--

CREATE TABLE `mental_health_assessments` (
  `assessment_id` varchar(50) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `assessor_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `assessment_type` varchar(50) NOT NULL COMMENT 'DASS-21, PHQ-9, GAD-7',
  `risk_level` enum('low','moderate','high') NOT NULL,
  `category` varchar(50) NOT NULL,
  `responses` text DEFAULT NULL COMMENT 'Assessment responses as JSON string',
  `recommendations` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mental_health_assessments`
--

INSERT INTO `mental_health_assessments` (`assessment_id`, `student_id`, `assessor_id`, `date`, `score`, `notes`, `assessment_type`, `risk_level`, `category`, `responses`, `recommendations`, `is_active`, `created_at`, `updated_at`) VALUES
('Integrated Mental Health-1749479308-1103220016', '1103220016', '1103220016', '2025-06-08 17:00:00', 35, 'HASIL ANALISIS KESEHATAN MENTAL KOMPREHENSIF\n============================================================\n\n📊 STATUS: MEMERLUKAN BANTUAN SEGERA 🚨\n✨ Interpretasi: Kondisi ini menunjukkan gejala berat yang memerlukan perhatian\n   medis dan psikologis segera untuk mencegah komplikasi lebih lanjut.\n\n📋 ANALISIS RINCI PER DOMAIN:\n--------------------------------------------------\n\n🧠 DEPRESI (PHQ-9): 23/27 - Berat\n   🚨 Gejala depresi berat. Memerlukan intervensi segera.\n   🎯 Gejala utama: perasaan sedih, gangguan tidur, kelelahan\n\n😔 DEPRESI (DASS-21): 30/42 - Sangat Berat\n   🚨 Depresi berat, memerlukan intervensi segera.\n\n😰 KECEMASAN (DASS-21): 26/42 - Sangat Berat\n   🚨 Kecemasan berat, memerlukan bantuan profesional.\n\n😤 STRES (DASS-21): 20/42 - Sedang\n   ⚠️ Stres sedang, butuh strategi coping yang lebih efektif.\n\n😟 KECEMASAN UMUM (GAD-7): 12/21 - Sedang\n   ⚠️ Kecemasan umum sedang, pertimbangkan konseling.\n\n🔍 ANALISIS POLA DAN FAKTOR RISIKO:\n----------------------------------------\n• Domain utama yang terdampak: DEPRESI\n  Fokus intervensi: Aktivasi perilaku, terapi kognitif\n• Komorbiditas: Terdapat 5 domain dengan gejala signifikan\n  (PHQ-9, DASS-Depresi, DASS-Kecemasan, DASS-Stres, GAD-7)\n  Rekomendasi: Pendekatan terintegrasi dan holistik\n\n💡 REKOMENDASI KOMPREHENSIF:\n========================================\n\n🏥 LANGKAH SEGERA:\n• SEGERA kunjungi psikiater atau layanan darurat mental health\n• Evaluasi untuk kemungkinan medikasi\n• Sistem dukungan 24/7 harus aktif\n• Hospitalisasi mungkin diperlukan jika ada risiko tinggi\n\n🧘 STRATEGI SELF-CARE:\n• Tidur: 7-9 jam per malam, jadwal konsisten\n• Olahraga: Minimal 30 menit, 3x seminggu\n• Nutrisi: Diet seimbang, hindari alkohol berlebihan\n• Mindfulness: Meditasi 10-15 menit harian\n• Sosial: Pertahankan koneksi dengan support system\n• Hobi: Aktivitas yang memberikan kegembiraan\n\n🎯 TERAPI YANG DIREKOMENDASIKAN:\n• Cognitive Behavioral Therapy (CBT) untuk depresi\n• Behavioral Activation untuk meningkatkan motivasi\n• Exposure and Response Prevention untuk kecemasan\n• Acceptance and Commitment Therapy (ACT)\n• Family/couples therapy jika diperlukan\n\n📞 KONTAK DARURAT:\n• Hotline Crisis: 119 ext 8\n• Halo Kemkes: 1500-567\n• LSM Jangan Bunuh Diri: 021-9696-9293\n• Emergency: 112 atau rumah sakit terdekat\n\n🚨 PERINGATAN KHUSUS:\nTerdeteksi adanya pikiran untuk menyakiti diri sendiri.\nSEGERA hubungi layanan krisis atau orang terdekat.\nJANGAN biarkan diri sendiri tanpa pengawasan.\n\n📋 FOLLOW-UP:\n• Asesmen ulang: 2 minggu\n• Target perbaikan skor: +10-15 poin dalam 3 bulan\n• Indikator keberhasilan: Perbaikan fungsi sehari-hari\n\n------------------------------------------------------------\nCatatan: Hasil ini adalah asesmen awal dan bukan diagnosis klinis.\nUntuk diagnosis dan treatment plan yang akurat, konsultasi dengan\nprofesional kesehatan mental tetap diperlukan.\n', 'Integrated Mental Health', 'high', 'self-assessment', '{\"1\": 2, \"2\": 3, \"3\": 3, \"4\": 3, \"5\": 2, \"6\": 2, \"7\": 2, \"8\": 3, \"9\": 3, \"10\": 3, \"11\": 3, \"12\": 3, \"13\": 3, \"14\": 3, \"15\": 2, \"16\": 2, \"17\": 1, \"18\": 0, \"19\": 1, \"20\": 1, \"21\": 1, \"22\": 1, \"23\": 0, \"24\": 1, \"25\": 2, \"26\": 3, \"27\": 2, \"28\": 2, \"29\": 2, \"30\": 2, \"31\": 2, \"32\": 2, \"33\": 2, \"34\": 2, \"35\": 0, \"36\": 2, \"37\": 2}', '[\"Follow-up assessment: 2 weeks\", \"Target improvement: +10-15 points in 3 months\", \"Success indicator: Improved daily functioning\", \"Immediate professional consultation recommended\"]', 1, '2025-06-09 14:28:28', '2025-06-09 14:28:28'),
('Integrated Mental Health-1749523657-1103210016', '1103210016', '1103210016', '2025-06-09 17:00:00', 96, 'HASIL ANALISIS KESEHATAN MENTAL KOMPREHENSIF\n============================================================\n\n📊 STATUS: KESEHATAN MENTAL SANGAT BAIK 💚\n✨ Interpretasi: Anda memiliki kesehatan mental yang sangat baik dengan resiliensi tinggi.\n   Kemampuan mengelola stres dan emosi berada pada level optimal.\n\n📋 ANALISIS RINCI PER DOMAIN:\n--------------------------------------------------\n\n🧠 DEPRESI (PHQ-9): 6/27 - Ringan\n   ⚡ Gejala depresi ringan. Mungkin mengalami penurunan mood sesekali.\n   🎯 Gejala utama: perasaan sedih, kehilangan minat\n\n😔 DEPRESI (DASS-21): 0/42 - Normal\n   ✅ Level depresi dalam rentang normal.\n\n😰 KECEMASAN (DASS-21): 0/42 - Normal\n   ✅ Level kecemasan dalam rentang normal.\n\n😤 STRES (DASS-21): 0/42 - Normal\n   ✅ Level stres dalam rentang normal.\n\n😟 KECEMASAN UMUM (GAD-7): 0/21 - Minimal\n   ✅ Tidak ada atau minimal kecemasan umum.\n\n🔍 ANALISIS POLA DAN FAKTOR RISIKO:\n----------------------------------------\n• Domain utama yang terdampak: DEPRESI\n  Fokus intervensi: Aktivasi perilaku, terapi kognitif\n\n💡 REKOMENDASI KOMPREHENSIF:\n========================================\n\n🏥 LANGKAH SEGERA:\n• Pertahankan gaya hidup sehat yang sudah berjalan\n• Lakukan asesmen berkala setiap 6 bulan\n• Jadilah role model kesehatan mental bagi orang lain\n\n🧘 STRATEGI SELF-CARE:\n• Tidur: 7-9 jam per malam, jadwal konsisten\n• Olahraga: Minimal 30 menit, 3x seminggu\n• Nutrisi: Diet seimbang, hindari alkohol berlebihan\n• Mindfulness: Meditasi 10-15 menit harian\n• Sosial: Pertahankan koneksi dengan support system\n• Hobi: Aktivitas yang memberikan kegembiraan\n\n🎯 TERAPI YANG DIREKOMENDASIKAN:\n• Family/couples therapy jika diperlukan\n\n📞 KONTAK DARURAT:\n• Hotline Crisis: 119 ext 8\n• Halo Kemkes: 1500-567\n• LSM Jangan Bunuh Diri: 021-9696-9293\n• Emergency: 112 atau rumah sakit terdekat\n\n📋 FOLLOW-UP:\n• Asesmen ulang: 3 bulan\n• Target perbaikan skor: +10-15 poin dalam 3 bulan\n• Indikator keberhasilan: Perbaikan fungsi sehari-hari\n\n------------------------------------------------------------\nCatatan: Hasil ini adalah asesmen awal dan bukan diagnosis klinis.\nUntuk diagnosis dan treatment plan yang akurat, konsultasi dengan\nprofesional kesehatan mental tetap diperlukan.\n', 'Integrated Mental Health', 'low', 'self-assessment', '{\"1\": 2, \"2\": 3, \"3\": 1, \"4\": 0, \"5\": 0, \"6\": 0, \"7\": 0, \"8\": 0, \"9\": 0, \"10\": 0, \"11\": 0, \"12\": 0, \"13\": 0, \"14\": 0, \"15\": 0, \"16\": 0, \"17\": 0, \"18\": 0, \"19\": 0, \"20\": 0, \"21\": 0, \"22\": 0, \"23\": 0, \"24\": 0, \"25\": 0, \"26\": 0, \"27\": 0, \"28\": 0, \"29\": 0, \"30\": 0, \"31\": 0, \"32\": 0, \"33\": 0, \"34\": 0, \"35\": 0, \"36\": 0, \"37\": 0}', '[\"Follow-up assessment: 3 months\", \"Target improvement: +10-15 points in 3 months\", \"Success indicator: Improved daily functioning\"]', 1, '2025-06-10 02:47:37', '2025-06-10 02:47:37'),
('Integrated Mental Health-1749528555-1103210016', '1103210016', '1103210016', '2025-06-09 17:00:00', 0, 'HASIL ANALISIS KESEHATAN MENTAL KOMPREHENSIF\n============================================================\n\n📊 STATUS: MEMERLUKAN BANTUAN SEGERA 🚨\n✨ Interpretasi: Kondisi ini menunjukkan gejala berat yang memerlukan perhatian\n   medis dan psikologis segera untuk mencegah komplikasi lebih lanjut.\n\n📋 ANALISIS RINCI PER DOMAIN:\n--------------------------------------------------\n\n🧠 DEPRESI (PHQ-9): 27/27 - Berat\n   🚨 Gejala depresi berat. Memerlukan intervensi segera.\n   🎯 Gejala utama: kehilangan minat, perasaan sedih, gangguan tidur\n\n😔 DEPRESI (DASS-21): 42/42 - Sangat Berat\n   🚨 Depresi berat, memerlukan intervensi segera.\n\n😰 KECEMASAN (DASS-21): 42/42 - Sangat Berat\n   🚨 Kecemasan berat, memerlukan bantuan profesional.\n\n😤 STRES (DASS-21): 42/42 - Sangat Berat\n   🚨 Stres berat, dapat mengganggu fungsi fisik dan mental.\n\n😟 KECEMASAN UMUM (GAD-7): 21/21 - Berat\n   🚨 Kecemasan umum berat, memerlukan evaluasi klinis.\n\n🔍 ANALISIS POLA DAN FAKTOR RISIKO:\n----------------------------------------\n• Domain utama yang terdampak: DEPRESI\n  Fokus intervensi: Aktivasi perilaku, terapi kognitif\n• Komorbiditas: Terdapat 5 domain dengan gejala signifikan\n  (PHQ-9, DASS-Depresi, DASS-Kecemasan, DASS-Stres, GAD-7)\n  Rekomendasi: Pendekatan terintegrasi dan holistik\n\n💡 REKOMENDASI KOMPREHENSIF:\n========================================\n\n🏥 LANGKAH SEGERA:\n• SEGERA kunjungi psikiater atau layanan darurat mental health\n• Evaluasi untuk kemungkinan medikasi\n• Sistem dukungan 24/7 harus aktif\n• Hospitalisasi mungkin diperlukan jika ada risiko tinggi\n\n🧘 STRATEGI SELF-CARE:\n• Tidur: 7-9 jam per malam, jadwal konsisten\n• Olahraga: Minimal 30 menit, 3x seminggu\n• Nutrisi: Diet seimbang, hindari alkohol berlebihan\n• Mindfulness: Meditasi 10-15 menit harian\n• Sosial: Pertahankan koneksi dengan support system\n• Hobi: Aktivitas yang memberikan kegembiraan\n\n🎯 TERAPI YANG DIREKOMENDASIKAN:\n• Cognitive Behavioral Therapy (CBT) untuk depresi\n• Behavioral Activation untuk meningkatkan motivasi\n• Exposure and Response Prevention untuk kecemasan\n• Acceptance and Commitment Therapy (ACT)\n• Stress Management Training\n• Mindfulness-Based Stress Reduction (MBSR)\n• Family/couples therapy jika diperlukan\n\n📞 KONTAK DARURAT:\n• Hotline Crisis: 119 ext 8\n• Halo Kemkes: 1500-567\n• LSM Jangan Bunuh Diri: 021-9696-9293\n• Emergency: 112 atau rumah sakit terdekat\n\n🚨 PERINGATAN KHUSUS:\nTerdeteksi adanya pikiran untuk menyakiti diri sendiri.\nSEGERA hubungi layanan krisis atau orang terdekat.\nJANGAN biarkan diri sendiri tanpa pengawasan.\n\n📋 FOLLOW-UP:\n• Asesmen ulang: 2 minggu\n• Target perbaikan skor: +10-15 poin dalam 3 bulan\n• Indikator keberhasilan: Perbaikan fungsi sehari-hari\n\n------------------------------------------------------------\nCatatan: Hasil ini adalah asesmen awal dan bukan diagnosis klinis.\nUntuk diagnosis dan treatment plan yang akurat, konsultasi dengan\nprofesional kesehatan mental tetap diperlukan.\n', 'Integrated Mental Health', 'high', 'self-assessment', '{\"1\": 3, \"2\": 3, \"3\": 3, \"4\": 3, \"5\": 3, \"6\": 3, \"7\": 3, \"8\": 3, \"9\": 3, \"10\": 3, \"11\": 3, \"12\": 3, \"13\": 3, \"14\": 3, \"15\": 3, \"16\": 3, \"17\": 3, \"18\": 3, \"19\": 3, \"20\": 3, \"21\": 3, \"22\": 3, \"23\": 3, \"24\": 3, \"25\": 3, \"26\": 3, \"27\": 3, \"28\": 3, \"29\": 3, \"30\": 3, \"31\": 3, \"32\": 3, \"33\": 3, \"34\": 3, \"35\": 3, \"36\": 3, \"37\": 3}', '[\"Follow-up assessment: 2 weeks\", \"Target improvement: +10-15 points in 3 months\", \"Success indicator: Improved daily functioning\", \"Immediate professional consultation recommended\"]', 1, '2025-06-10 04:09:15', '2025-06-10 04:09:15');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `is_read` tinyint(1) DEFAULT 0,
  `action_url` varchar(500) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` varchar(50) NOT NULL,
  `academic_status` enum('good','warning','critical') DEFAULT 'good',
  `program` varchar(50) DEFAULT NULL,
  `mental_health_score` int(11) DEFAULT NULL,
  `last_counseling` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `class_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `academic_status`, `program`, `mental_health_score`, `last_counseling`, `is_active`, `created_at`, `updated_at`, `class_id`, `user_id`) VALUES
('1103210016', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:26', '2025-06-09 14:43:26', 'CLS003', '1103210016'),
('1103220016', 'good', '', NULL, NULL, 1, '2025-06-02 06:21:28', '2025-06-02 06:21:28', 'CLS005', '1103220016'),
('1103250001', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250001'),
('1103250002', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:58', '2025-06-09 14:42:58', 'CLS002', '1103250002'),
('1103250003', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250003'),
('1103250004', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250004'),
('1103250005', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:26', '2025-06-09 14:43:26', 'CLS003', '1103250005'),
('1103250006', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250006'),
('1103250007', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250007'),
('1103250008', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:58', '2025-06-09 14:42:58', 'CLS002', '1103250008'),
('1103250009', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250009'),
('1103250010', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250010'),
('1103250011', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250011'),
('1103250012', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:56', '2025-06-09 14:43:56', 'CLS004', '1103250012'),
('1103250013', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:56', '2025-06-09 14:43:56', 'CLS004', '1103250013'),
('1103250014', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250014'),
('1103250015', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250015'),
('1103250016', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250016'),
('1103250017', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:56', '2025-06-09 14:43:56', 'CLS004', '1103250017'),
('1103250018', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:58', '2025-06-09 14:42:58', 'CLS002', '1103250018'),
('1103250019', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:26', '2025-06-09 14:43:26', 'CLS003', '1103250019'),
('1103250020', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250020'),
('1103250021', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250021'),
('1103250022', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250022'),
('1103250023', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250023'),
('1103250024', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250024'),
('1103250025', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250025'),
('1103250026', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250026'),
('1103250027', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250027'),
('1103250028', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:58', '2025-06-09 14:42:58', 'CLS002', '1103250028'),
('1103250029', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250029'),
('1103250030', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:56', '2025-06-09 14:43:56', 'CLS004', '1103250030'),
('1103250031', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:26', '2025-06-09 14:43:26', 'CLS003', '1103250031'),
('1103250032', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250032'),
('1103250033', 'good', '', NULL, NULL, 1, '2025-06-09 14:43:26', '2025-06-09 14:43:26', 'CLS003', '1103250033'),
('1103250034', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250034'),
('1103250035', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250035'),
('1103250036', 'good', '', NULL, NULL, 1, '2025-06-02 07:16:16', '2025-06-02 07:16:16', 'CLS004', '1103250036'),
('1103250037', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250037'),
('1103250038', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250038'),
('1103250039', 'good', '', NULL, NULL, 1, '2025-06-09 14:42:31', '2025-06-09 14:42:31', 'CLS001', '1103250039'),
('1103250040', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', '1103250040'),
('STU001', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', 'STU001'),
('TEST_STUDENT_DELETE', 'good', NULL, NULL, NULL, 0, '2025-06-09 14:38:24', '2025-06-09 14:41:42', NULL, 'TEST_USER_DELETE'),
('TST001', 'good', '', NULL, NULL, 1, '2025-06-09 14:44:42', '2025-06-09 14:44:42', 'CLS005', 'TST001');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('admin','counselor','student') NOT NULL,
  `photo` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `name`, `role`, `photo`, `is_active`, `created_at`, `updated_at`) VALUES
('1103210016', 'haky', 'haky@example.com', '$2b$12$PoljHSEgfnDwb1eZ.sNTMOgnZuyGzYuDOm86T3bM.69tC2YkVvBsm', 'haky', 'student', '', 1, '2025-06-02 00:23:24', '2025-06-02 05:48:06'),
('1103220016', 'pandukh', 'pandukh@example.com', '$2b$12$3GTh4tJKf4UNyQ9xhAkBW.eZsOnwiYI8zJbmd5kV/Lvs4VdVl.kwi', 'Pandu Kaya Hakiki', 'student', '', 1, '2025-06-02 00:23:32', '2025-06-02 07:12:24'),
('1103250001', 'adityapratama', 'adityapratama@example.com', '$2b$12$a4SgNWUXc.Ffv81nO1ANJuza5D/TCJ4/CBC38r9nK9oF0InkWgtkG', 'Aditya Pratama', 'student', NULL, 1, '2025-06-02 00:23:10', '2025-06-02 00:23:10'),
('1103250002', 'aguswijaya', 'aguswijaya@example.com', '$2b$12$xE.uxZcm/8/qrHPll.dRW.psQD4tmeuovMeXdgGZvUjAM6OVzPLHO', 'Agus Wijaya', 'student', NULL, 1, '2025-06-02 00:23:11', '2025-06-02 00:23:11'),
('1103250003', 'alice.smith', 'alice.smith@example.com', '$2b$12$t1NcGxtdZwVAPSNw1dAsRu1y9rGGYsurAOrnu.4OlxgMVOHXjh8HC', 'Alice Smith', 'student', NULL, 1, '2025-06-02 00:23:12', '2025-06-02 00:23:12'),
('1103250004', 'ayuwulandari', 'ayuwulandari@example.com', '$2b$12$z5i/ncCFIwGLgjwE5WdNYeyO6e/RAXE7I5BH1LXp8Wm6H1AOBPuVO', 'Ayu Wulandari', 'student', NULL, 1, '2025-06-02 00:23:12', '2025-06-02 00:23:12'),
('1103250005', 'bayukrisna', 'bayukrisna@example.com', '$2b$12$Hg1v5khKETuY5d1Ie4coIe.0hUWgKXc/.lXo5gjOtVYLZSY8Q1SZq', 'Bayu Krisna', 'student', NULL, 1, '2025-06-02 00:23:13', '2025-06-02 00:23:13'),
('1103250006', 'bob.johnson', 'bob.johnson@example.com', '$2b$12$zVVGVyMcSFxXn4W/Yn9.h.Qbwy1S2l6lGLSjV4NUO8DA/V4k1a6ri', 'Bob Johnson', 'student', NULL, 1, '2025-06-02 00:23:14', '2025-06-02 00:23:14'),
('1103250007', 'bobwilson', 'bobwilson@example.com', '$2b$12$4LLiaKIX1UgnUOXwJhVrUu1ZY2X2v0IFD3K9S5.4lPJ7SKgKhxZPe', 'Bob Wilson', 'student', NULL, 1, '2025-06-02 00:23:14', '2025-06-02 00:23:14'),
('1103250008', 'budisantoso', 'budisantoso@example.com', '$2b$12$qKXv46heJwJ8CSqFIW/Ew.dUGrPc7cfcXXrFfHCBqYD3ppIun.rGe', 'Budi Santoso', 'student', NULL, 1, '2025-06-02 00:23:15', '2025-06-02 00:23:15'),
('1103250009', 'carol.davis', 'carol.davis@example.com', '$2b$12$fl3.2KRBdwB6jmqw6MQ4vevKkFb8amZA9ZwRdR/pn7T8Pik.ISg7u', 'Carol Davis', 'student', NULL, 1, '2025-06-02 00:23:15', '2025-06-02 00:23:15'),
('1103250010', 'charliegreen', 'charliegreen@example.com', '$2b$12$Npgc/S6ySKjnYvRTiAOD9eSF9qQSmFHJ9N4JUr7of3dJptCpXYUK2', 'Charlie Green', 'student', NULL, 1, '2025-06-02 00:23:16', '2025-06-02 00:23:16'),
('1103250011', 'citradewi', 'citradewi@example.com', '$2b$12$T38sMHsgvLPus3o5z4PiC.mMhAUfE7ksMj440K0aQ9R9Zde9gcETK', 'Citra Dewi', 'student', NULL, 1, '2025-06-02 00:23:16', '2025-06-02 00:23:16'),
('1103250012', 'david.wilson', 'david.wilson@example.com', '$2b$12$qHVSdYCTBHTexW1e21DtmehGLebL6ihWQxdZPX1JarK82Qona5/ui', 'David Wilson', 'student', NULL, 1, '2025-06-02 00:23:17', '2025-06-02 00:23:17'),
('1103250013', 'dewilestari', 'dewilestari@example.com', '$2b$12$f3XNVVKRELQRxSjgbp65ieWuQNILxSJfyo2.4ydVlZXPxJUHq3kZa', 'Dewi Lestari', 'student', NULL, 1, '2025-06-02 00:23:18', '2025-06-02 00:23:18'),
('1103250014', 'dimassaputra', 'dimassaputra@example.com', '$2b$12$r4EdUOviY07bUfk4RtbNTu6jSxStHrLkKgmpVmVWh/OXw2TzUJBNC', 'Dimas Saputra', 'student', NULL, 1, '2025-06-02 00:23:18', '2025-06-02 00:23:18'),
('1103250015', 'ekoprasetyo', 'ekoprasetyo@example.com', '$2b$12$sjbbRtVVo2feQK2WDxCaNefPCStegyvPLuSZewI3cdJkrJgdhgozm', 'Eko Prasetyo', 'student', NULL, 1, '2025-06-02 00:23:19', '2025-06-02 00:23:19'),
('1103250016', 'emma.brown', 'emma.brown@example.com', '$2b$12$oWrKDd/iEY2gBwqkhqxguuh9cNL.4tYjsYwrP/eFqVRD4paPgGKSK', 'Emma Brown', 'student', NULL, 1, '2025-06-02 00:23:20', '2025-06-02 00:23:20'),
('1103250017', 'fajarsetiawan', 'fajarsetiawan@example.com', '$2b$12$kXsB3xbm4PCraIzv6KFE6O/XB6zvSFv8Rp77M4JJofa0ZnZJuYwoS', 'Fajar Setiawan', 'student', NULL, 1, '2025-06-02 00:23:20', '2025-06-02 00:23:20'),
('1103250018', 'fitrihandayani', 'fitrihandayani@example.com', '$2b$12$EQJ6R7IQ9q4Es/8dHFmlfeKEOQ84jV9VgI3QFp1miov0k3SLPfnPe', 'Fitri Handayani', 'student', NULL, 1, '2025-06-02 00:23:21', '2025-06-02 00:23:21'),
('1103250019', 'frank.miller', 'frank.miller@example.com', '$2b$12$fdDK32j0JpNHsT.57MYl6.AFE9VOSpmxJb/R7sgXyOAeM6TyJK5cO', 'Frank Miller', 'student', NULL, 1, '2025-06-02 00:23:21', '2025-06-02 00:23:21'),
('1103250020', 'gilangramadhan', 'gilangramadhan@example.com', '$2b$12$pYlU5atN6pCZieDj43SwSexM5Vq.JLbg0x0bBPhdzDAYQ8LgW2FXK', 'Gilang Ramadhan', 'student', NULL, 1, '2025-06-02 00:23:22', '2025-06-02 00:23:22'),
('1103250021', 'gitamaharani', 'gitamaharani@example.com', '$2b$12$7hUyn7HpyCcOoj9KreKmlukF1cIArBOruDQvQsEypBkW0zjJzcrfa', 'Gita Maharani', 'student', NULL, 1, '2025-06-02 00:23:23', '2025-06-02 00:23:23'),
('1103250022', 'grace.lee', 'grace.lee@example.com', '$2b$12$nE1KzHwFFU5wmbNi.XSS1ep.kBkJs3CkpUSgBMX.wwkU8RlwMpFTG', 'Grace Lee', 'student', NULL, 1, '2025-06-02 00:23:23', '2025-06-02 00:23:23'),
('1103250023', 'hanayulianti', 'hanayulianti@example.com', '$2b$12$lLOy2WdAruZyr.YKaKrjnO5QqZaa5X2STSU1gkaXGC7/GyQYrZjeO', 'Hana Yulianti', 'student', NULL, 1, '2025-06-02 00:23:25', '2025-06-02 00:23:25'),
('1103250024', 'hendragunawan', 'hendragunawan@example.com', '$2b$12$MkZYlB6l3HZmHV34amsP4egDdlrug0GywIFs8nWF3lsPiY5MrDedC', 'Hendra Gunawan', 'student', NULL, 1, '2025-06-02 00:23:25', '2025-06-02 00:23:25'),
('1103250025', 'henry.zhang', 'henry.zhang@example.com', '$2b$12$nFD29i7BLN2HDZ2h3I/2XeDQBVP5mgPsZvUbDLm.MNw7LG0tB.NwK', 'Henry Zhang', 'student', NULL, 1, '2025-06-02 00:23:26', '2025-06-02 00:23:26'),
('1103250026', 'indahsari', 'indahsari@example.com', '$2b$12$xNs29.pn7MlBa67S/giwPe3LYm4QcEC0l6OiR4O2kkkqyo6ewBKFK', 'Indah Sari', 'student', NULL, 1, '2025-06-02 00:23:26', '2025-06-02 00:23:26'),
('1103250027', 'irfanmaulana', 'irfanmaulana@example.com', '$2b$12$6kt4KVWbQCmE66HBN6yU8uouMeYcZ3hkoljwIA4INdT6X2oByCXN2', 'Irfan Maulana', 'student', NULL, 1, '2025-06-02 00:23:27', '2025-06-02 00:23:27'),
('1103250028', 'jihanpermata', 'jihanpermata@example.com', '$2b$12$Z.d7gPGSLnb4yPSQWdTUKujJls6.TkGWLbQA5VJRANe7mnqzFDt1O', 'Jihan Permata', 'student', NULL, 1, '2025-06-02 00:23:27', '2025-06-02 00:23:27'),
('1103250029', 'jokosusilo', 'jokosusilo@example.com', '$2b$12$Mu.Z0eJhWVBv7UzPHv6tI.pfF/ipRqldypRSt7itsxBHWNUG.h8IG', 'Joko Susilo', 'student', NULL, 1, '2025-06-02 00:23:28', '2025-06-02 00:23:28'),
('1103250030', 'linamarlina', 'linamarlina@example.com', '$2b$12$SEwVubSs.KHExz4zxV4q8O1T8zQO8.tCBXOiSNAN0QSt2SKXIe4ye', 'Lina Marlina', 'student', NULL, 1, '2025-06-02 00:23:29', '2025-06-02 00:23:29'),
('1103250031', 'mayawati', 'mayawati@example.com', '$2b$12$DrgG3qdm.oxrxJcPcz6uKO4tSpsZBQ5zFoMSTXEZ765gumnN547sW', 'Maya Wati', 'student', NULL, 1, '2025-06-02 00:23:29', '2025-06-02 00:23:29'),
('1103250032', 'muhammadzaki', 'muhammadzaki@example.com', '$2b$12$dilWgs4yhVcec7Vy2trjjOnu3f2fQF6pq4s0jpZZleXyXkMc23juy', 'Muhammad Zaki', 'student', NULL, 1, '2025-06-02 00:23:30', '2025-06-02 00:23:30'),
('1103250033', 'nurulhidayah', 'nurulhidayah@example.com', '$2b$12$WMHUHB/wMmv8LELFAWPwo.4utC2ycntLAsXlzpvU3GWWXpL8d16Ty', 'Nurul Hidayah', 'student', NULL, 1, '2025-06-02 00:23:31', '2025-06-02 00:23:31'),
('1103250034', 'puttriamelia', 'puttriamelia@example.com', '$2b$12$Ju6MxJKOcOKSQXAPXdzAj.g43/OkXxUZiQL3XnHlFGT3uqq4e3Ks.', 'Putri Amelia', 'student', NULL, 1, '2025-06-02 00:23:32', '2025-06-02 00:23:32'),
('1103250035', 'ratnakusuma', 'ratnakusuma@example.com', '$2b$12$U5Xz3K7qJG286l0Jclhgr.NmKL72Ct3Ww1MO7cin1Zg7RC9tipeB.', 'Ratna Kusuma', 'student', NULL, 1, '2025-06-02 00:23:33', '2025-06-02 00:23:33'),
('1103250036', 'rizkynugroho', 'rizkynugroho@example.com', '$2b$12$QyDUZ99bbnfaIOwfDi4Ua.zloXZ5E/t/q80mWKShPeAAJH8cijavW', 'Rizky Nugroho', 'student', NULL, 1, '2025-06-02 00:23:33', '2025-06-02 00:23:33'),
('1103250037', 'saripuspita', 'saripuspita@example.com', '$2b$12$mM36JgWOm2Jz8gv3MAHDseCAloKVOrQXkyvf1.fvc1LXQMHCUL5U6', 'Sari Puspita', 'student', NULL, 1, '2025-06-02 00:23:34', '2025-06-02 00:23:34'),
('1103250038', 'sitiaminah', 'sitiaminah@example.com', '$2b$12$m5bq2B9QYLZ4tOvTtaOarO84Nu/OpRdhdNn9Sgx3vFXhi7xJ7v2oe', 'Siti Aminah', 'student', NULL, 1, '2025-06-02 00:23:35', '2025-06-02 00:23:35'),
('1103250039', 'suryaabdullah', 'suryaabdullah@example.com', '$2b$12$YmL8DmBwov8hTxR/IZ81lOz9aRyuJI5yyk7HVA/sACO4AjhcVcQ3a', 'Surya Abdullah', 'student', NULL, 1, '2025-06-02 00:23:35', '2025-06-02 00:23:35'),
('1103250040', 'yogapurnomo', 'yogapurnomo@example.com', '$2b$12$oFJYJvjt405VgXjC8a45I.rFo4DJFRG5z3ssE3xWEyi4NKa8ZUPWC', 'Yoga Purnomo', 'student', NULL, 1, '2025-06-02 00:23:36', '2025-06-02 00:23:36'),
('1103260001', 'KIky', 'kiky@example..com', '$2b$12$opwlYbuyMEmeBYrzqkvxEeeKy2NQEhRm.pp5WNW2yDoRtnI805lUC', 'kiky', 'student', '', 1, '2025-06-10 04:40:04', '2025-06-10 04:40:04'),
('ADM-2025-001', 'admin', 'admin@example.com', '$2b$12$a056EXCSHW0t3xmwh.WwDurH7b82sOYtMBOR7OE/Ma.IvTfQ49Xpa', 'Administrator', 'admin', 'data:image/jpeg;base64,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GOzCvFNtjHyDec0khkA3lhGCe3eqFW1D2u0MOAtVPVPZI3U4lpO8Facc8kSq5q6lrUYfBUta2RuTdN1i13jbepkD4qGmbTjhyjzqd8hwHqqzZLk613NlZyfLOaHdEuxnI7UubANLx17lwI+eR7kc5c0JhoKeGNYmNsi68/HUldo7y69Vkc5gEOhmgAO1Z3544CsFn25fBTMguVMZtI08qwjJHeCqVhF6ZUSMcr2rmpEuH08sSQub2U01y8S+V23jREWW2i0Ejc+Q8P8AaP1Vese0E9suc1a+MVD5gQ/U7BOTnOfkoVFL6mV7kcq5oeYsNpoo3RtZk7XXPxO693F91uc1Y+MRmTHRBzgAY4/JcKIsLnK5VVdTcjY2NqMalkTIIiLyewiIgCIikBERQAiIgCIiAIiIAiIgCIikBERAERFBAREQBERSAiIgCIiAIiIAiIoAREQBERAEREAbxCkrn+GZ4qNbveB3qSuX4dvihJGovlZQGUWEQgyuihdplx2rnTODu4oSd9bTueQ5gyesLTT0r3OBf0WhfLKyVu4kO8V9OrJCN2B4IDdcngxtb15UcvouLjlxyVhAZREUkBERQAiIgCIiEhERAERFICIigBERAEREAREQBERAERFICIiAIiIAiIgCIiCwREQBERBYIiILBERAEREBhFlFACIvuNuXDKA6qKlziR/DqC65oWzN0ly0Vk5ia1ke4kcVwske14cHHKAzUQOhfg7weBWlSlYOUpwTuPFRpbjrUg+VnKIoATCLKAxhMLKIDGEWUQGEWUUgIiILBERQAiIgCIiAIiIAiIgCIiAIiKQEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAX004IXyigEnNAKlrXNdvwtLaGRrgSQQuaKeSL2Hbuxfbqyd27VjwCkHRcHgRhg4rgWHOJOSclEARMLKALCysKAZWERAEREBlFhZUgIiIAiIoFwiIpFwiIoFwiIguEREFwiIguEREICIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIDCwvpFJJ8r6REAREUEBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREUgIiKAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREB//2Q==', 1, '2025-06-02 00:23:07', '2025-06-02 00:24:21'),
('ADM-2025-002', 'michael.chen', 'michael.chen@example.com', '$2b$12$orCXiFfH5ZtIHlCZUW3hDuwLAKvhnzFplsIQqaQZzqJuH7rfXXh4e', 'Dr. Michael Chen', 'admin', NULL, 1, '2025-06-02 00:23:07', '2025-06-02 00:23:07'),
('ADM-2025-003', 'johndoe', 'johndoe@example.com', '$2b$12$Pz/qXCr/ztnZl8a0V2FQweh7E4T4ISGGNwDGpVU8psCNe65pIF2ye', 'John Doe', 'admin', NULL, 1, '2025-06-02 00:23:08', '2025-06-02 00:23:08'),
('ADM-2025-004', 'admin4', 'admin4@example.com', '$2b$12$na/quycSFGTzGhDfZ1aGKO1o71PYrzUnu//L6/PNRtiUd4yvjslEO', 'Admin4', 'admin', '', 1, '2025-06-02 00:11:33', '2025-06-02 00:25:30'),
('KSL-2025-001', 'alicebrown', 'alicebrown@example.com', '$2b$12$3C5pnBC0cXcuEEVoqDk7AuUfn62C5jEIfAp6jR.Iq6usj.pGy2tuq', 'Alice Brown', 'counselor', '', 1, '2025-06-02 00:23:08', '2025-06-02 11:26:36'),
('KSL-2025-002', 'sarah.johnso', 'sarah.johnso@example.com', '$2b$12$9QO2nL8b3h8g8bEdW6VpZuvxK8JMsQ6D04yua7GVuYdjQvrowfT/e', 'Dr. Sarah Johnson', 'counselor', NULL, 1, '2025-06-02 00:23:09', '2025-06-02 00:23:09'),
('KSL-2025-003', 'janesmith', 'janesmith@example.com', '$2b$12$EwJYhlvsWlK2Azfc/HR4w.dUlRWww8AhU89dF/29lmS8INesjZUXO', 'Jane Smith', 'counselor', NULL, 1, '2025-06-02 00:23:10', '2025-06-02 00:23:10'),
('KSL-2025-004', 'azka', 'adhiaris@example.com', '$2b$12$EWZfQ/9A54LNerwMH4oNvuEDeFc3pOaaGl7gZUmXICAkzVt.UkEJ.', 'Adhiaris Muhammad Azka', 'counselor', '', 1, '2025-06-03 15:34:50', '2025-06-10 04:22:08'),
('STU001', 'teststudent', 'test.student@example.com', '$2b$12$yVyT9C8hpC37wsX.BSzUleO13HYCxMvJPTlIJyzjzoC4U/Pces3ZC', 'Test Student', 'student', '', 1, '2025-06-02 02:02:24', '2025-06-02 02:02:24'),
('TEST_USER_DELETE', 'testuser', 'test@example.com', 'hash', 'Test User', 'student', NULL, 1, '2025-06-09 14:38:24', '2025-06-09 14:38:24'),
('TST001', 'testcsv', 'testcsv@example.com', '$2b$12$NVDTg7czZfr.4B0l5J208.P3bS9TdY0wmkV0uJ.cz5D1ODTj1zw4.', 'Test User From CSV', 'student', NULL, 1, '2025-06-02 04:48:45', '2025-06-02 04:48:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `behavior_records`
--
ALTER TABLE `behavior_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `idx_record_id` (`record_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_reporter_id` (`reporter_id`),
  ADD KEY `idx_behavior_type` (`behavior_type`),
  ADD KEY `idx_severity` (`severity`);

--
-- Indexes for table `career_assessments`
--
ALTER TABLE `career_assessments`
  ADD PRIMARY KEY (`assessment_id`),
  ADD KEY `idx_assessment_id` (`assessment_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_assessment_type` (`assessment_type`);

--
-- Indexes for table `career_resources`
--
ALTER TABLE `career_resources`
  ADD PRIMARY KEY (`resource_id`),
  ADD KEY `idx_resource_id` (`resource_id`),
  ADD KEY `idx_resource_type` (`resource_type`),
  ADD KEY `idx_title` (`title`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_id`),
  ADD KEY `idx_class_id` (`class_id`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_academic_year` (`academic_year`);

--
-- Indexes for table `counseling_sessions`
--
ALTER TABLE `counseling_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_session_id` (`session_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_counselor_id` (`counselor_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_session_type` (`session_type`),
  ADD KEY `fk_approved_by` (`approved_by`),
  ADD KEY `idx_approval_status` (`approval_status`);

--
-- Indexes for table `mental_health_assessments`
--
ALTER TABLE `mental_health_assessments`
  ADD PRIMARY KEY (`assessment_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_notification_id` (`notification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_academic_status` (`academic_status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `behavior_records`
--
ALTER TABLE `behavior_records`
  ADD CONSTRAINT `behavior_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `behavior_records_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `career_assessments`
--
ALTER TABLE `career_assessments`
  ADD CONSTRAINT `career_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `counseling_sessions`
--
ALTER TABLE `counseling_sessions`
  ADD CONSTRAINT `counseling_sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `counseling_sessions_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
