import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Payment from '../models/Payment.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

router.get('/payments/mine', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const householdId = req.user.sub;
    const payments = await Payment.find({ household_id: householdId }).sort({ payment_date: -1 }).limit(100);
    res.json(payments.map(p => stripPrivateFields(p)));
}));

router.post('/payments', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { amount_due, currency, payment_method, type, package_id, month_year, due_date } = req.body;
    const payment = await Payment.create({
        id: newId(),
        household_id: req.user.sub,
        amount_due,
        amount_paid: 0,
        currency: currency || 'INR',
        payment_method,
        type,
        package_id,
        month_year,
        due_date,
        is_paid: false,
        payment_date: new Date().toISOString(),
    });
    res.json(stripPrivateFields(payment));
}));

export default router;
