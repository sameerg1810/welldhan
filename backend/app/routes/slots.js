import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Slot from '../models/Slot.js';
import Trainer from '../models/Trainer.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.get('/slots', getCurrentUser, asyncHandler(async (req, res) => {
    const slots = await Slot.find({ is_available: true }).limit(1000);
    const result = [];
    for (const s of slots) {
        const trainer = await Trainer.findOne({ id: s.trainer_id });
        const sObj = s.toObject();
        sObj.trainer = trainer ? stripPrivateFields(trainer) : null;
        sObj.spots_left = (s.max_capacity || 0) - (s.current_booked || 0);
        result.push(stripPrivateFields(sObj));
    }
    res.json(result);
}));

router.get('/slots/by-sport/:sport', getCurrentUser, asyncHandler(async (req, res) => {
    const { sport } = req.params;
    const slots = await Slot.find({ is_available: true, sport: sport }).limit(1000);
    res.json(slots.map(s => stripPrivateFields(s)));
}));

router.get('/slots/trainer', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Trainer') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const trainerId = req.user.sub;
    const slots = await Slot.find({ trainer_id: trainerId }).limit(500);
    res.json(slots.map(s => stripPrivateFields(s)));
}));

router.post('/slots', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { sport, trainer_id, slot_time, slot_days, max_capacity, community_id } = req.body;
    
    const slot = await Slot.create({
        id: newId(),
        sport,
        trainer_id,
        slot_time,
        slot_days,
        max_capacity,
        current_booked: 0,
        is_available: true,
        community_id: community_id,
    });
    res.json(stripPrivateFields(slot));
}));

router.patch('/slots/:slot_id', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { slot_id } = req.params;
    const update = {};
    const allowedFields = ['sport', 'trainer_id', 'slot_time', 'slot_days', 'max_capacity', 'is_available', 'is_active'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            update[field] = req.body[field];
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: 'No fields to update', detail: 'No fields to update' });
    }

    await Slot.updateOne({ id: slot_id }, { $set: update });
    const s = await Slot.findOne({ id: slot_id });
    if (!s) {
        return res.status(404).json({ message: 'Slot not found', detail: 'Slot not found' });
    }
    res.json(stripPrivateFields(s));
}));

router.delete('/slots/:slot_id', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { slot_id } = req.params;
    await Slot.updateOne({ id: slot_id }, { $set: { is_available: false } });
    res.json({ success: true });
}));

export default router;
