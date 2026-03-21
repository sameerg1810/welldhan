import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Notification from '../models/Notification.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.get('/notifications/mine', getCurrentUser, asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications.map(n => stripPrivateFields(n)));
}));

router.patch('/notifications/:notification_id/read', getCurrentUser, asyncHandler(async (req, res) => {
    const { notification_id } = req.params;
    const userId = req.user.sub;
    const n = await Notification.findOne({ id: notification_id, user_id: userId });
    if (!n) {
        return res.status(404).json({ message: 'Notification not found', detail: 'Notification not found' });
    }
    await Notification.updateOne({ id: notification_id }, { $set: { is_read: true } });
    res.json({ success: true });
}));

router.post('/notifications', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { user_id, title, body, type } = req.body;
    const notification = await Notification.create({
        id: newId(),
        user_id,
        title,
        body,
        type,
        is_read: false
    });
    res.json(stripPrivateFields(notification));
}));

export default router;
