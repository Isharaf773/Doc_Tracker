ALTER TABLE records ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255) NULL;
ALTER TABLE records ADD COLUMN IF NOT EXISTS sender_department VARCHAR(120) NULL DEFAULT 'Non Department';
ALTER TABLE records ADD COLUMN IF NOT EXISTS handler_department VARCHAR(120) NULL;
UPDATE records SET sender_department = 'Non Department' WHERE sender_department IS NULL OR sender_department = '';
UPDATE records SET handler_department = dept WHERE handler_department IS NULL OR handler_department = '';
