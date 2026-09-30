-- ==============================================================
-- Campus Smart Resource Management System (CSRM)
-- Database Creation & Schema Setup Script
-- Target Database: csrm_db
-- Compatible with MySQL 8.0+
-- ==============================================================

CREATE DATABASE IF NOT EXISTS csrm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE csrm_db;

-- -------------------------------------------------------------
-- Table 1: USERS
-- Stores credentials, role (ADMIN, FACULTY, STUDENT), and status
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_status (status),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table 2: RESOURCES
-- Stores campus resources (Classrooms, Labs, Lockers, Equipment)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    availability VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    description TEXT,
    capacity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resource_type (type),
    INDEX idx_resource_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table 3: BOOKINGS
-- Conflict-free resource reservations with status & time ranges
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_booking_resource_status (resource_id, status),
    INDEX idx_booking_time_range (start_time, end_time),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table 4: AUDIT_LOGS
-- Comprehensive activity audit logging for all sensitive events
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_timestamp (timestamp),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- Table 5: NOTIFICATIONS
-- In-app notifications for booking & account lifecycle events
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, read_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------
-- SEED DATA
-- Default BCrypt hash corresponds to password: Password@123
-- ($2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre)
-- -------------------------------------------------------------

INSERT IGNORE INTO users (id, username, password, email, role, status, created_at) VALUES
(1, 'admin', '$2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre', 'admin@csrm.com', 'ADMIN', 'ACTIVE', NOW()),
(2, 'faculty', '$2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre', 'faculty@csrm.com', 'FACULTY', 'ACTIVE', NOW()),
(3, 'student', '$2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre', 'student@csrm.com', 'STUDENT', 'ACTIVE', NOW()),
(4, 'rahul_kumar', '$2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre', 'rahul@csrm.com', 'STUDENT', 'PENDING', NOW()),
(5, 'dr_sharma', '$2a$10$JfelG8.0y3rovvfIAmd3BO.1g81Vly7z12K.tP1r6o3GZ8L3FwSre', 'sharma@csrm.com', 'FACULTY', 'PENDING', NOW());

INSERT IGNORE INTO resources (id, name, type, location, availability, description, capacity, created_at) VALUES
(1, 'Auditorium Hall A', 'CLASSROOM', 'Main Campus, Building 1, Floor 1', 'AVAILABLE', 'Main campus auditorium with 4K laser projector, surround sound, and stage.', 200, NOW()),
(2, 'Lecture Hall 101', 'CLASSROOM', 'Science Block, Floor 1', 'AVAILABLE', 'Tiered lecture hall equipped with smart podium and dual interactive displays.', 60, NOW()),
(3, 'Seminar Room 302', 'CLASSROOM', 'Management Block, Floor 3', 'AVAILABLE', 'Conference setup with high-definition video conferencing and wireless presentation.', 35, NOW()),
(4, 'Advanced AI & Robotics Lab', 'LAB', 'Tech Center, Room 204', 'AVAILABLE', '30 GPU workstations, NVIDIA CUDA setup, ROS robotics developer kits.', 30, NOW()),
(5, 'Cyber Security & Networks Lab', 'LAB', 'IT Block, Room 105', 'AVAILABLE', 'Isolated network sandbox environment for vulnerability assessment and forensics.', 40, NOW()),
(6, 'IoT & Prototyping Lab', 'LAB', 'Tech Center, Room 208', 'MAINTENANCE', 'Oscilloscopes, spectrum analyzers, and soldering stations (Scheduled calibration).', 25, NOW()),
(7, 'Smart Locker Bay A-01', 'LOCKER', 'Central Library, Ground Floor', 'AVAILABLE', 'Digital RFID keycard locker with internal fast device charging port.', 1, NOW()),
(8, 'Smart Locker Bay A-02', 'LOCKER', 'Central Library, Ground Floor', 'AVAILABLE', 'Digital RFID keycard locker for daily student use.', 1, NOW()),
(9, 'Athletics Locker Bay B-05', 'LOCKER', 'Sports Complex, Ground Floor', 'AVAILABLE', 'Spacious ventilated locker for sports equipment and gear.', 1, NOW()),
(10, 'Sony FX6 Cinema 4K Camera Kit', 'EQUIPMENT', 'Media Studio, Booth 2', 'AVAILABLE', 'Broadcast quality camera with 24-70mm GM lens, wireless lav mics, and carbon tripod.', 1, NOW()),
(11, 'Ultimaker S5 Industrial 3D Printer', 'EQUIPMENT', 'MakerSpace, Zone C', 'AVAILABLE', 'Dual-extrusion composite-ready 3D printer with PLA and ABS filament kits.', 1, NOW()),
(12, 'Dell Precision Mobile Workstation #4', 'EQUIPMENT', 'IT Helpdesk, Desk 1', 'UNAVAILABLE', 'Core i9, 64GB RAM, RTX 4000 GPU (Temporarily checked out for maintenance).', 1, NOW());
