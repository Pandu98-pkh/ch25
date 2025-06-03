-- CounselorHub Database CREATE Statements
-- Generated from current database structure

-- BEHAVIOR_RECORDS TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`record_id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_behavior_type` (`behavior_type`),
  KEY `idx_severity` (`severity`),
  CONSTRAINT `behavior_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `behavior_records_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CAREER_ASSESSMENTS TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_id`),
  KEY `idx_assessment_id` (`assessment_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_assessment_type` (`assessment_type`),
  CONSTRAINT `career_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CAREER_RESOURCES TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`resource_id`),
  KEY `idx_resource_id` (`resource_id`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_title` (`title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CLASSES TABLE
CREATE TABLE `classes` (
  `class_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade_level` varchar(10) NOT NULL,
  `student_count` int(11) DEFAULT 0,
  `academic_year` varchar(10) NOT NULL,
  `teacher_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`class_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_grade_level` (`grade_level`),
  KEY `idx_academic_year` (`academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COUNSELING_SESSIONS TABLE
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
  `follow_up` text DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_counselor_id` (`counselor_id`),
  KEY `idx_date` (`date`),
  KEY `idx_session_type` (`session_type`),
  KEY `fk_approved_by` (`approved_by`),
  KEY `idx_approval_status` (`approval_status`),
  CONSTRAINT `counseling_sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `counseling_sessions_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MENTAL_HEALTH_ASSESSMENTS TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`assessment_id`),
  KEY `idx_assessment_id` (`assessment_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_assessor_id` (`assessor_id`),
  KEY `idx_assessment_type` (`assessment_type`),
  KEY `idx_risk_level` (`risk_level`),
  CONSTRAINT `mental_health_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `mental_health_assessments_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATIONS TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `idx_notification_id` (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STUDENTS TABLE
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
  `user_id` varchar(50) NOT NULL,
  PRIMARY KEY (`student_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_academic_status` (`academic_status`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE SET NULL,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USERS TABLE
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

