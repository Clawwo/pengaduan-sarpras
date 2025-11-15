-- Fix stuck notifications issue
-- This script cleans up orphaned and old unread notifications

-- 1. Check current state
SELECT 
    nh.id, 
    nh.user_id, 
    u.username,
    nh.title, 
    nh.is_read, 
    nh.sent_at,
    TIMESTAMPDIFF(HOUR, nh.sent_at, NOW()) as hours_ago
FROM notification_history nh
LEFT JOIN pengaduan_sarpras_user u ON nh.user_id = u.id_user
WHERE nh.is_read = 0
ORDER BY nh.sent_at DESC;

-- 2. Find orphaned notifications (no matching user)
SELECT 
    nh.id, 
    nh.user_id,
    nh.title,
    nh.sent_at,
    'ORPHANED - No user match' as status
FROM notification_history nh
LEFT JOIN pengaduan_sarpras_user u ON nh.user_id = u.id_user
WHERE nh.is_read = 0 AND u.id_user IS NULL;

-- 3. Delete orphaned notifications (CAREFUL - backup first!)
-- DELETE nh FROM notification_history nh
-- LEFT JOIN pengaduan_sarpras_user u ON nh.user_id = u.id_user
-- WHERE u.id_user IS NULL;

-- 4. Mark old unread notifications as read (older than 7 days)
-- UPDATE notification_history 
-- SET is_read = 1 
-- WHERE is_read = 0 
--   AND sent_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- 5. (OPTIONAL) Clear all stuck unread for specific user_id
-- UPDATE notification_history 
-- SET is_read = 1 
-- WHERE user_id = ? AND is_read = 0;

-- 6. Verify fix - check unread count per user
SELECT 
    u.id_user,
    u.username,
    u.role,
    COUNT(*) as unread_count,
    MAX(nh.sent_at) as latest_notification
FROM notification_history nh
JOIN pengaduan_sarpras_user u ON nh.user_id = u.id_user
WHERE nh.is_read = 0
GROUP BY u.id_user, u.username, u.role
ORDER BY unread_count DESC;
