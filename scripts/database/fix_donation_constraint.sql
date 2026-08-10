-- Fix for Donation Foreign Key Constraint Error
-- This makes screening_id optional in the donation table

USE blood_bank_db;

-- Make screening_id nullable (optional)
ALTER TABLE donation MODIFY COLUMN screening_id INT NULL;

-- Verify the change
DESCRIBE donation;

SELECT 'Donation table fixed! screening_id is now optional.' as Status;
