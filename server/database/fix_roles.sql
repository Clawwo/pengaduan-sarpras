-- Fix existing roles in database to be lowercase and trimmed
-- Run this SQL to normalize all existing role data

USE pengaduan_sarpras;

-- Update all roles to lowercase and trimmed
UPDATE pengaduan_sarpras_user 
SET role = LOWER(TRIM(role))
WHERE role IS NOT NULL;

-- Verify the update
SELECT 
    id_user,
    username,
    role,
    CHAR_LENGTH(role) as role_length,
    ASCII(SUBSTRING(role, 1, 1)) as first_char_ascii
FROM pengaduan_sarpras_user
ORDER BY id_user;

-- Check for any unusual role values
SELECT role, COUNT(*) as count
FROM pengaduan_sarpras_user
GROUP BY role;
