-- Quick Fix for Gender Column Error
-- Run this in MySQL to fix the gender column issue

USE blood_bank_db;

-- Check current structure
DESCRIBE donor;

-- Fix the gender column to allow proper values
ALTER TABLE donor MODIFY COLUMN gender VARCHAR(10) NOT NULL;

-- Verify the change
DESCRIBE donor;

SELECT 'Gender column fixed! You can now register donors.' as Status;
