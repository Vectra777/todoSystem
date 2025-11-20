-- Migration to add file upload metadata columns
-- Run this SQL script on your database

ALTER TABLE files 
ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS stored_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS size INTEGER,
ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(10);

-- Add foreign key constraint if it doesn't exist
ALTER TABLE files 
ADD CONSTRAINT fk_files_uploaded_by 
FOREIGN KEY (uploaded_by) REFERENCES employees(id) 
ON DELETE SET NULL;
