import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import Household from '../models/Household.js';
import Member from '../models/Member.js';
import Trainer from '../models/Trainer.js';
import Payment from '../models/Payment.js';
import FoodInventory from '../models/FoodInventory.js';

const router = express.Router();

router.get('/dashboard/summary', getCurrentUser, asyncHandler(async (req, res) => {
    const role = req.user.role;
    const userId = req.user.sub;
    const today = new Date().toISOString().split('T')[0];

    if (role === 'User') {
        const upcomingBookings = await Booking.countDocuments({ household_id: userId, status: 'Confirmed', session_date: { $gte: today } });
        const pastBookings = await Booking.countDocuments({ household_id: userId, session_date: { $lt: today } });
        const members = await Member.countDocuments({ household_id: userId, is_active: true });
        const household = await Household.findOne({ id: userId });

        res.json({
            upcoming_bookings: upcomingBookings,
            past_bookings: pastBookings,
            total_members: members,
            food_plan_active: household ? household.food_plan_active : false,
        });
    } else if (role === 'Trainer') {
        const todayBookings = await Booking.countDocuments({ trainer_id: userId, session_date: today });
        const totalSlots = await Slot.countDocuments({ trainer_id: userId, is_active: true });
        
        res.json({
            today_bookings: todayBookings,
            total_slots: totalSlots,
        });
    } else if (role === 'Manager') {
        const communityId = userId;
        const totalFamilies = await Household.countDocuments({ community_id: communityId, is_active: true });
        const activeFamilies = await Household.countDocuments({ community_id: communityId, is_active: true }); // simplified
        const todayBookings = await Booking.countDocuments({ 
            session_date: today, 
            household_id: { $in: (await Household.find({ community_id: communityId }, { id: 1 })).map(h => h.id) } 
        });
        
        const pendingPayments = await Payment.countDocuments({ is_paid: false });
        const pendingAmountResult = await Payment.aggregate([
            { $match: { is_paid: false } },
            { $group: { _id: null, total: { $sum: "$amount_due" } } }
        ]);
        const pendingAmount = pendingAmountResult.length > 0 ? pendingAmountResult[0].total : 0;
        const lowStockItems = await FoodInventory.countDocuments({ $expr: { $lte: ["$stock_quantity", "$reorder_level"] } });

        res.json({
            total_families: totalFamilies,
            active_families: activeFamilies,
            todays_bookings: todayBookings,
            pending_payments: pendingPayments,
            pending_amount: pendingAmount,
            low_stock_items: lowStockItems,
        });
    } else if (role === 'Admin') {
        const totalHouseholds = await Household.countDocuments({ is_active: true });
        const totalTrainers = await Trainer.countDocuments({ is_active: true });
        const totalPayments = await Payment.countDocuments({ is_paid: true });
        const todayBookings = await Booking.countDocuments({ session_date: today });

        res.json({
            total_households: totalHouseholds,
            total_trainers: totalTrainers,
            total_payments: totalPayments,
            today_bookings: todayBookings,
        });
    } else {
        res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
}));

export default router;
