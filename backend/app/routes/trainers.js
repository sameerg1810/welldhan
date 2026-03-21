import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Trainer from '../models/Trainer.js';
import { stripPrivateFields } from '../utils/helpers.js';

const router = express.Router();

router.get('/trainers', getCurrentUser, asyncHandler(async (req, res) => {
    const { community_id, sport } = req.query;
    const query = { is_active: true };
    if (community_id) query.community_id = community_id;
    if (sport) query.sport = sport;
    
    const trainers = await Trainer.find(query).limit(100);
    res.json(trainers.map(t => stripPrivateFields(t)));
}));

router.get('/trainers/:trainer_id', getCurrentUser, asyncHandler(async (req, res) => {
    const { trainer_id } = req.params;
    const trainer = await Trainer.findOne({ id: trainer_id });
    if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found', detail: 'Trainer not found' });
    }
    res.json(stripPrivateFields(trainer));
}));

router.get('/trainer/profile', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Trainer') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const trainer = await Trainer.findOne({ id: req.user.sub });
    if (!trainer) {
        return res.status(404).json({ message: 'Trainer not found', detail: 'Trainer not found' });
    }
    res.json(stripPrivateFields(trainer));
}));

export default router;
