import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import Household from '../models/Household.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.post('/bookings', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const { member_id, slot_id, session_date, notes } = req.body;

    const member = await Member.findOne({ id: member_id, household_id: householdId, is_active: true });
    if (!member) {
        return res.status(404).json({ message: 'Member not found', detail: 'Member not found' });
    }

    const slot = await Slot.findOne({ id: slot_id, is_available: true });
    if (!slot) {
        return res.status(404).json({ message: 'Slot not found', detail: 'Slot not found' });
    }

    if (slot.current_booked >= slot.max_capacity) {
        return res.status(400).json({ message: 'No spots left', detail: 'No spots left' });
    }

    const booking = await Booking.create({
        id: newId(),
        household_id: householdId,
        member_id: member_id,
        slot_id: slot_id,
        trainer_id: slot.trainer_id || '',
        session_date: session_date,
        status: 'Confirmed',
        booked_on: new Date().toISOString(),
        notes: notes || '',
    });

    await Slot.updateOne({ id: slot_id }, { $inc: { current_booked: 1 } });
    const slot2 = await Slot.findOne({ id: slot_id });
    if (slot2) {
        await Slot.updateOne({ id: slot_id }, { $set: { is_available: slot2.current_booked < slot2.max_capacity } });
    }

    res.json({ success: true, booking_id: booking.id });
}));

router.get('/bookings/mine', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const bookings = await Booking.find({ household_id: householdId }).sort({ session_date: -1 }).limit(200);
    
    const result = [];
    for (const b of bookings) {
        const slot = await Slot.findOne({ id: b.slot_id });
        const trainer = await Trainer.findOne({ id: b.trainer_id });
        const member = await Member.findOne({ id: b.member_id });
        const bObj = b.toObject();
        bObj.slot = slot ? stripPrivateFields(slot) : null;
        bObj.trainer = trainer ? stripPrivateFields(trainer) : null;
        bObj.member = member ? stripPrivateFields(member) : null;
        result.push(stripPrivateFields(bObj));
    }
    res.json(result);
}));

router.get('/bookings/mine/upcoming', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({ 
        household_id: householdId, 
        status: 'Confirmed', 
        session_date: { $gte: today } 
    }).sort({ session_date: -1 }).limit(200);

    res.json(bookings.map(b => stripPrivateFields(b)));
}));

router.get('/bookings/mine/past', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const householdId = req.user.sub;
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({ 
        household_id: householdId, 
        session_date: { $lt: today } 
    }).sort({ session_date: -1 }).limit(200);

    res.json(bookings.map(b => stripPrivateFields(b)));
}));

router.patch('/bookings/:booking_id/cancel', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { booking_id } = req.params;
    const householdId = req.user.sub;
    const b = await Booking.findOne({ id: booking_id, household_id: householdId });
    if (!b) {
        return res.status(404).json({ message: 'Booking not found', detail: 'Booking not found' });
    }
    if (b.status === 'Cancelled') {
        return res.json({ success: true });
    }

    await Booking.updateOne({ id: booking_id }, { $set: { status: 'Cancelled' } });
    await Slot.updateOne({ id: b.slot_id }, { $inc: { current_booked: -1 }, $set: { is_available: true } });
    res.json({ success: true });
}));

router.get('/bookings/trainer', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Trainer') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const trainerId = req.user.sub;
    const today = new Date().toISOString().split('T')[0];
    const bookings = await Booking.find({ trainer_id: trainerId, session_date: today }).limit(200);
    
    const result = [];
    for (const b of bookings) {
        const member = await Member.findOne({ id: b.member_id });
        const hh = await Household.findOne({ id: b.household_id });
        const slot = await Slot.findOne({ id: b.slot_id });
        const bObj = b.toObject();
        bObj.member = member ? stripPrivateFields(member) : null;
        bObj.household = hh ? stripPrivateFields(hh) : null;
        bObj.slot = slot ? stripPrivateFields(slot) : null;
        result.push(stripPrivateFields(bObj));
    }
    res.json(result);
}));

router.patch('/bookings/attendance', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'Trainer') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { booking_id, status } = req.body;
    const trainerId = req.user.sub;
    const b = await Booking.findOne({ id: booking_id, trainer_id: trainerId });
    if (!b) {
        return res.status(404).json({ message: 'Booking not found', detail: 'Booking not found' });
    }
    if (!['Attended', 'NoShow'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status', detail: 'Invalid status' });
    }

    await Booking.updateOne({ id: booking_id }, { $set: { status: status } });
    res.json({ success: true });
}));

router.get('/bookings/all', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }

    const { status, sport } = req.query;
    const query = {};
    if (status) query.status = status;
    
    if (req.user.role === 'Manager') {
        const households = await Household.find({ community_id: req.user.sub }, { id: 1 });
        query.household_id = { $in: households.map(h => h.id) };
    }

    const bookings = await Booking.find(query).sort({ session_date: -1 }).limit(500);
    const result = [];
    for (const b of bookings) {
        const slot = await Slot.findOne({ id: b.slot_id });
        if (sport && slot && slot.sport !== sport) continue;
        
        const trainer = await Trainer.findOne({ id: b.trainer_id });
        const member = await Member.findOne({ id: b.member_id });
        const hh = await Household.findOne({ id: b.household_id });
        
        const bObj = b.toObject();
        bObj.slot = slot ? stripPrivateFields(slot) : null;
        bObj.trainer = trainer ? stripPrivateFields(trainer) : null;
        bObj.member = member ? stripPrivateFields(member) : null;
        bObj.household = hh ? stripPrivateFields(hh) : null;
        result.push(stripPrivateFields(bObj));
    }
    res.json(result);
}));

export default router;
