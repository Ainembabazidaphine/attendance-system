-- EduTrack Pro Database Schema for MySQL 5.7.36
CREATE DATABASE IF NOT EXISTS edutrack_pro;
USE edutrack_pro;

-- Users Table
-- Reduced email to 191 to fit within MySQL 5.7's 767-byte index limit (191 * 4 = 764 bytes)
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(8) NOT NULL,
    role ENUM('student', 'teacher', 'admin', 'it_admin') DEFAULT 'student',
    status ENUM('active', 'inactive') DEFAULT 'active',
    classId VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(128) NOT NULL,
    userName VARCHAR(255),
    status ENUM('present', 'absent', 'late') NOT NULL,
    attendance_date DATE NOT NULL,
    subject VARCHAR(100),
    classId VARCHAR(50),
    verified BOOLEAN DEFAULT TRUE,
    entry_type VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_user FOREIGN KEY (userId) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    authorId VARCHAR(128) NOT NULL,
    authorName VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    fileName VARCHAR(255),
    report_type ENUM('text', 'pdf') DEFAULT 'text',
    status ENUM('pending', 'reviewed') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_author FOREIGN KEY (authorId) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed initial admin
INSERT IGNORE INTO users (uid, name, email, password, role, status) 
VALUES ('sim_it', 'Okello Solomon', '999@nextgen.ac.com', 'Supp9123', 'it_admin', 'active');
