import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Household from '../models/Household.js';
import Package from '../models/Package.js';
import Community from '../models/Community.js';
import Member from '../models/Member.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.get('/households/me', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const hh = await Household.findOne({ id: householdId });
    if (!hh) {
        return res.status(404).json({ message: 'Household not found', detail: 'Household not found' });
    }

    const pkg = await Package.findOne({ id: hh.package_id });
    const comm = await Community.findOne({ id: hh.community_id });
    const members = await Member.find({ household_id: householdId, is_active: true }).limit(50);

    const hhObj = hh.toObject();
    hhObj.package = pkg ? stripPrivateFields(pkg) : null;
    hhObj.community = comm ? stripPrivateFields(comm) : null;
    hhObj.members = members.map(m => stripPrivateFields(m));

    res.json(stripPrivateFields(hhObj));
}));

router.patch('/households/me', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const update = {};
    const allowedFields = ['primary_name', 'primary_phone', 'flat_number', 'plan_type', 'food_plan_active', 'fcm_token'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            update[field] = req.body[field];
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: 'No fields to update', detail: 'No fields to update' });
    }

    const householdId = req.user.sub;
    await Household.updateOne({ id: householdId }, { $set: update });
    res.json({ success: true });
}));

router.get('/households/me/members', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const members = await Member.find({ household_id: householdId });
    res.json(members.map(m => stripPrivateFields(m)));
}));

router.post('/households/me/members', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const { member_name, age, relation, assigned_sport, phone } = req.body;
    
    const member = await Member.create({
        id: newId(),
        household_id: householdId,
        member_name: member_name,
        age: age,
        relation: relation,
        assigned_sport: assigned_sport,
        phone: phone || '',
        is_primary: false,
        is_active: true,
    });

    await Household.updateOne({ id: householdId }, { $inc: { total_members: 1 } });
    res.json(stripPrivateFields(member));
}));

router.patch('/households/me/members/:member_id', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { member_id } = req.params;
    const householdId = req.user.sub;

    const update = {};
    const allowedFields = ['member_name', 'age', 'assigned_sport', 'is_active'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            update[field] = req.body[field];
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: 'No fields to update', detail: 'No fields to update' });
    }

    const m = await Member.findOne({ id: member_id, household_id: householdId });
    if (!m) {
        return res.status(404).json({ message: 'Member not found', detail: 'Member not found' });
    }

    await Member.updateOne({ id: member_id }, { $set: update });
    const m2 = await Member.findOne({ id: member_id });
    res.json(m2 ? stripPrivateFields(m2) : { success: true });
}));

router.delete('/households/me/members/:member_id', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { member_id } = req.params;
    const householdId = req.user.sub;

    const m = await Member.findOne({ id: member_id, household_id: householdId });
    if (!m) {
        return res.status(404).json({ message: 'Member not found', detail: 'Member not found' });
    }

    await Member.updateOne({ id: member_id }, { $set: { is_active: false } });
    res.json({ success: true });
}));

router.get('/households', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const query = {};
    if (req.user.role === 'Manager') {
        query.community_id = req.user.sub;
    }

    const households = await Household.find(query).limit(500);
    const result = [];
    for (const hh of households) {
        const pkg = await Package.findOne({ id: hh.package_id });
        const hhObj = hh.toObject();
        hhObj.package = pkg ? stripPrivateFields(pkg) : null;
        result.push(stripPrivateFields(hhObj));
    }
    res.json(result);
}));

router.get('/households/:household_id', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { household_id } = req.params;
    const hh = await Household.findOne({ id: household_id });
    if (!hh) {
        return res.status(404).json({ message: 'Household not found', detail: 'Household not found' });
    }

    if (req.user.role === 'Manager' && hh.community_id !== req.user.sub) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const pkg = await Package.findOne({ id: hh.package_id });
    const comm = await Community.findOne({ id: hh.community_id });
    const members = await Member.find({ household_id: household_id });

    const hhObj = hh.toObject();
    hhObj.package = pkg ? stripPrivateFields(pkg) : null;
    hhObj.community = comm ? stripPrivateFields(comm) : null;
    hhObj.members = members.map(m => stripPrivateFields(m));

    res.json(stripPrivateFields(hhObj));
}));

export default router;
