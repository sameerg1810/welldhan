import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Community from '../models/Community.js';
import Household from '../models/Household.js';
import Trainer from '../models/Trainer.js';
import { stripPrivateFields } from '../utils/helpers.js';

const router = express.Router();

router.get('/community/me', getCurrentUser, asyncHandler(async (req, res) => {
    const user = req.user;
    let communityId = null;

    if (user.role === 'Manager') {
        communityId = user.sub;
    } else if (user.role === 'User') {
        const hh = await Household.findOne({ id: user.sub });
        if (hh) communityId = hh.community_id;
    } else if (user.role === 'Trainer') {
        const t = await Trainer.findOne({ id: user.sub });
        if (t) communityId = t.community_id;
    }

    if (!communityId && user.role !== 'Admin') {
        return res.status(404).json({ message: 'Community context not found', detail: 'Community context not found' });
    }

    if (user.role === 'Admin') {
        // Admin doesn't have a single community, return first or all
        const community = await Community.findOne({});
        return res.json(stripPrivateFields(community));
    }

    const community = await Community.findOne({ id: communityId });
    if (!community) {
        return res.status(404).json({ message: 'Community not found', detail: 'Community not found' });
    }
    res.json(stripPrivateFields(community));
}));

router.get('/community/all', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const communities = await Community.find({}).limit(100);
    res.json(communities.map(c => stripPrivateFields(c)));
}));

export default router;
