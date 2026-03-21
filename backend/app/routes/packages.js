import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Package from '../models/Package.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.get('/packages', getCurrentUser, asyncHandler(async (req, res) => {
    const packages = await Package.find({ is_active: true }).limit(50);
    res.json(packages.map(p => stripPrivateFields(p)));
}));

router.post('/packages', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { name, description, price, duration_days, sport_limits, other_benefits } = req.body;
    const pkg = await Package.create({
        id: newId(),
        name,
        description,
        price,
        duration_days,
        sport_limits: sport_limits || {},
        other_benefits: other_benefits || [],
        is_active: true,
    });
    res.json(stripPrivateFields(pkg));
}));

export default router;
