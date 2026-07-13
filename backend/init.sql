-- Create the DocTrack database and seed demo data
CREATE DATABASE IF NOT EXISTS doctrack;
USE doctrack;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  department VARCHAR(100) NOT NULL DEFAULT 'Administration',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  department VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT '',
  docs INT DEFAULT 0,
  scans INT DEFAULT 0,
  online BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  dept VARCHAR(120) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  handler VARCHAR(120) NOT NULL,
  location VARCHAR(255) NOT NULL,
  priority VARCHAR(50) DEFAULT 'Routine',
  sender_email VARCHAR(255) NOT NULL,
  due_date DATE NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journey_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_code VARCHAR(64) NOT NULL,
  step_order INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  meta VARCHAR(255) NOT NULL,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_record_code (record_code)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(80) NOT NULL,
  message TEXT NOT NULL,
  unread BOOLEAN DEFAULT true,
  time VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example admin user for local testing
INSERT INTO admins (name, email, password, role, department)
VALUES
  ('Ishara Fernando', 'isharaf773@gmail.com', '1234', 'admin', 'IT Department'),
  ('Ishara Fernando', 'ishara@gmail.com', '1234', 'admin', 'Administration')
ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = VALUES(role), department = VALUES(department);

INSERT INTO users (name, email, role, department, category, docs, scans, online)
VALUES
  ('Amal Karunaratne', 'amal@geomine.gov.lk', 'admin', 'IT Department', '', 142, 89, true),
  ('Nimal Siriwardena', 'nimal@geomine.gov.lk', 'staff', 'Legal Department', '', 87, 56, true),
  ('Kamani Perera', 'kamani@geomine.gov.lk', 'staff', 'Finance Department', '', 63, 41, false),
  ('Ruwan Jayawardena', 'ruwan@geomine.gov.lk', 'staff', 'Procurement', '', 54, 38, false),
  ('Dilani Mendis', 'dilani@geomine.gov.lk', 'staff', 'HR Department', '', 48, 29, true),
  ('Priya Fernando', 'priya@geomine.gov.lk', 'admin', 'Compliance', '', 71, 52, false),
  ('J M S N Jayasinghe', 'jmsn.jayasinghe@geomine.gov.lk', 'staff', 'Chairman', 'Board of Management', 0, 0, false),
  ('N W A M M K N Bandara', 'n.bandara@geomine.gov.lk', 'staff', 'Director General', 'Board of Management', 0, 0, false),
  ('W D S C Weliwatte', 'w.weliwatte@geomine.gov.lk', 'staff', 'Member', 'Board of Management', 0, 0, false),
  ('Mahesh Abesekara', 'mahesh.abesekara@geomine.gov.lk', 'staff', 'Member', 'Board of Management', 0, 0, false),
  ('A R Wickremasinghe', 'ar.wickremasinghe@geomine.gov.lk', 'staff', 'Member', 'Board of Management', 0, 0, false),
  ('N W B Balasooriya', 'nw.balasooriya@geomine.gov.lk', 'staff', 'Member', 'Board of Management', 0, 0, false),
  ('M N C Samarawickrama', 'mnc.samarawickrama@geomine.gov.lk', 'staff', 'Member', 'Board of Management', 0, 0, false),
  ('Samanthi Rahubadda', 'samanthi.rahubadda@geomine.gov.lk', 'staff', 'Board Secretary', 'Board of Management', 0, 0, false),
  ('J M S N Jayasinghe', 'jmsn.jayasinghe.sm@geomine.gov.lk', 'staff', 'Chairman', 'Senior Management', 0, 0, false),
  ('N W A M M K N Bandara', 'n.bandara.sm@geomine.gov.lk', 'staff', 'Director General', 'Senior Management', 0, 0, false),
  ('S W M Senevirathna', 'swms.senevirathna@geomine.gov.lk', 'staff', 'Senior Director (Geology) - Cover-up', 'Senior Management', 0, 0, false),
  ('L A Fernando', 'la.fernando@geomine.gov.lk', 'staff', 'Senior Director (Mines) — Acting', 'Senior Management', 0, 0, false),
  ('Darani Wijesundara', 'darani.wijesundara@geomine.gov.lk', 'staff', 'Director Mapping & Geo Information (Cover-up)', 'Senior Management', 0, 0, false),
  ('H A Priyanka Jayalath', 'h.priyanka@geomine.gov.lk', 'staff', 'Director Laboratories and Materials Testing (Acting)', 'Senior Management', 0, 0, false),
  ('D D R S Maduwantha', 'ddrs.maduwantha@geomine.gov.lk', 'staff', 'Director Mineral Titling (Acting)', 'Senior Management', 0, 0, false),
  ('H Kushan Gunasekera', 'kushan.gunasekera@geomine.gov.lk', 'staff', 'Director, Environmental Impact Assessments and Regions (Acting)', 'Senior Management', 0, 0, false),
  ('K V Jagath Keerthi Kumara', 'kv.jagath@geomine.gov.lk', 'staff', 'Director Mines Safety', 'Senior Management', 0, 0, false),
  ('Sumeda Rahubadda', 'sumeda.rahubadda@geomine.gov.lk', 'staff', 'Finance Director', 'Senior Management', 0, 0, false),
  ('VACANT', 'vacant.hr@geomine.gov.lk', 'staff', 'Director Human Resources', 'Senior Management', 0, 0, false),
  ('Darshani Samarawickrama', 'darshani.samarawickrama@geomine.gov.lk', 'staff', 'Director Legal', 'Senior Management', 0, 0, false),
  ('Nalin De Sliva', 'nalin.desilva@geomine.gov.lk', 'staff', 'Director Mineral Surveys', 'Senior Management', 0, 0, false)
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), department = VALUES(department), category = VALUES(category);

INSERT INTO records (record_code, name, dept, status, handler, location, priority, sender_email, due_date)
VALUES
  ('DOC-2026-0341', 'Contract Review — Phase 3', 'Legal', 'transit', 'Nimal S.', 'Legal department', 'High', 'nimal@geomine.gov.lk', '2026-06-30'),
  ('DOC-2026-0340', 'Annual Budget Report', 'Finance', 'active', 'Kamani P.', 'Finance department', 'Routine', 'kamani@geomine.gov.lk', '2026-07-05'),
  ('DOC-2026-0339', 'Supplier Agreement NW', 'Procurement', 'pending', 'Ruwan J.', 'Procurement department', 'Critical', 'ruwan@geomine.gov.lk', '2026-06-28'),
  ('DOC-2026-0338', 'Q2 Audit Summary', 'Compliance', 'active', 'Priya F.', 'Compliance department', 'Routine', 'priya@geomine.gov.lk', '2026-07-02');

INSERT INTO journey_logs (record_code, step_order, action, meta, done)
VALUES
  ('DOC-2026-0341', 1, 'Received — Legal dept.', 'Nimal S. · Today 10:32 AM · "For signature"', true),
  ('DOC-2026-0341', 2, 'Dispatched — Finance dept.', 'Kamani P. · Today 9:14 AM · "Reviewed & approved"', true),
  ('DOC-2026-0341', 3, 'Received — Finance dept.', 'Priya F. · Yesterday 3:45 PM · "Budget check"', true),
  ('DOC-2026-0341', 4, 'Dispatched — Procurement', 'Ruwan J. · Yesterday 11:20 AM', true),
  ('DOC-2026-0341', 5, 'QR sticker generated', 'Admin · 3 Jun 2026 4:55 PM · Initial registration', true),
  ('DOC-2026-0341', 6, 'Awaiting final approval', 'Pending · CEO office', false);

INSERT INTO notifications (type, message, unread, time)
VALUES
  ('alert', 'DOC-2026-0335 is overdue — stuck at Procurement past 48hr threshold', true, '5 minutes ago'),
  ('scan', 'DOC-2026-0341 received at Legal by Nimal Siriwardena', true, '2 hours ago'),
  ('user', 'New user Dilani Mendis added with Staff role', true, 'Today 9:00 AM'),
  ('transfer', 'DOC-2026-0339 dispatched from Procurement — awaiting Finance', true, 'Yesterday 4:30 PM'),
  ('backup', 'System backup completed — 1,248 records archived', true, 'Yesterday 2:00 AM'),
  ('scan', 'DOC-2026-0338 received at Compliance by Priya Fernando', false, '2 days ago'),
  ('record', '3 new records registered — DOC-2026-0339, 0340, 0341', false, '2 days ago');
