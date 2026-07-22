-- Add journey attachments support to DocTrack
-- This migration adds the ability to attach PDF/photo files to journey steps during document transfers

CREATE TABLE IF NOT EXISTS journey_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journey_id INT NOT NULL,
  record_code VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(120) NOT NULL,
  file_size INT NOT NULL,
  file_data LONGBLOB NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_journey_id (journey_id),
  INDEX idx_record_code (record_code),
  FOREIGN KEY (journey_id) REFERENCES journey_logs(id) ON DELETE CASCADE
);

-- Add column to journey_logs to track if attachments exist
ALTER TABLE journey_logs ADD COLUMN has_attachments BOOLEAN DEFAULT false AFTER done;

-- Add comment/description column to journey_logs
ALTER TABLE journey_logs ADD COLUMN description TEXT NULL AFTER has_attachments;
