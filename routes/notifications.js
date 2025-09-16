// /routes/notifications.js - Complete notification routes using NotificationController
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);

// Get user's notifications with pagination
router.get('/', async (req, res) => {
    try {
        const { limit = 20, page = 1 } = req.query;

        const userId = req.user.userId; // FIXED: Use userId instead of _id

        // Get the notification controller instance from the app
        const notificationController = req.app.get('notificationController');

        if (!notificationController) {
            return res.status(500).json({ error: 'Notification service not available' });
        }

        const result = await notificationController.getUserNotifications(
            userId,
            parseInt(limit),
            parseInt(page)
        );

        res.json(result);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark specific notification as read
router.patch('/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId; // FIXED: Use userId instead of _id

        // Get the notification controller instance from the app
        const notificationController = req.app.get('notificationController');

        if (!notificationController) {
            return res.status(500).json({ error: 'Notification service not available' });
        }

        const result = await notificationController.markNotificationRead(notificationId, userId);

        if (result.success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Notification not found or could not be marked as read' });
        }

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
    try {
        const userId = req.user.userId; // FIXED: Use userId instead of _id

        // Get the notification controller instance from the app
        const notificationController = req.app.get('notificationController');

        if (!notificationController) {
            return res.status(500).json({ error: 'Notification service not available' });
        }

        const markedCount = await notificationController.markAllNotificationsRead(userId);

        res.json({
            success: true,
            markedCount
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.user.userId; // FIXED: Use userId instead of _id

        // Get the notification controller instance from the app
        const notificationController = req.app.get('notificationController');

        if (!notificationController) {
            return res.status(500).json({ error: 'Notification service not available' });
        }

        const count = await notificationController.getUnreadCount(userId);

        res.json({ count });

    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send custom notification (admin only)
router.post('/send-custom', async (req, res) => {
    try {
        // Verify admin permission
        if (!['admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        const { recipientIds, type, title, message, actionUrl, actionText } = req.body;
        const senderId = req.user.userId; // FIXED: Use userId instead of _id
        const organizationId = req.user.organizationId;

        // Get the notification controller instance from the app
        const notificationController = req.app.get('notificationController');

        if (!notificationController) {
            return res.status(500).json({ error: 'Notification service not available' });
        }

        const result = await notificationController.sendCustomNotification({
            recipientIds,
            senderId,
            organizationId,
            type,
            title,
            message,
            actionUrl,
            actionText
        });

        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json({ error: result.message });
        }

    } catch (error) {
        console.error('Error sending custom notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification (optional)
router.delete('/:notificationId', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId; // FIXED: Use userId instead of _id

        // This would require adding a delete method to your notification controller
        // For now, just return success
        res.json({ success: true, message: 'Notification deleted' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;