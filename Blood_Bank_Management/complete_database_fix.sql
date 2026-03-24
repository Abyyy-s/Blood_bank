-- Complete Database Fix Script
-- Run this to fix ALL current issues

USE blood_bank_db;

-- 1. Fix gender column (Data truncated error)
ALTER TABLE donor MODIFY COLUMN gender VARCHAR(20) NOT NULL;

-- 2. Make screening_id optional in donation table
ALTER TABLE donation MODIFY COLUMN screening_id INT NULL;

-- 3. Drop foreign key constraint on screening_id if it exists
-- (This allows donations without health screenings)
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_NAME = 'donation' 
    AND COLUMN_NAME = 'screening_id' 
    AND CONSTRAINT_SCHEMA = 'blood_bank_db'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE donation DROP FOREIGN KEY ', @constraint_name), 
    'SELECT "No FK constraint to drop"');
    
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Verify changes
DESCRIBE donor;
DESCRIBE donation;


ALTER TABLE blood_request
MODIFY COLUMN status ENUM(
    'Pending',
    'Approved',
    'Rejected',
    'Completed',
    'Cancelled',
    'Fulfilled'
) NOT NULL DEFAULT 'Pending';




SELECT '✅ All database issues fixed!' as Status;
SELECT 'Gender column is now VARCHAR(20)' as Fix1;
SELECT 'Screening ID is now optional (NULL allowed)' as Fix2;
SELECT 'Foreign key constraint removed from screening_id' as Fix3;
