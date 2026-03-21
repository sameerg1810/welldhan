import express from 'express';
import { getCurrentUser } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import FoodInventory from '../models/FoodInventory.js';
import FoodPreference from '../models/FoodPreference.js';
import FoodOrder from '../models/FoodOrder.js';
import { stripPrivateFields, newId } from '../utils/helpers.js';

const router = express.Router();

// Inventory
router.get('/food/inventory', getCurrentUser, asyncHandler(async (req, res) => {
    const items = await FoodInventory.find({ is_available: true }).limit(100);
    res.json(items.map(i => stripPrivateFields(i)));
}));

router.get('/food/inventory/low-stock', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const items = await FoodInventory.find({ 
        $expr: { $lte: ["$stock_quantity", "$reorder_level"] } 
    });
    res.json(items.map(i => stripPrivateFields(i)));
}));

router.patch('/food/inventory/:id/stock', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { id } = req.params;
    const { stock_quantity } = req.body;
    await FoodInventory.updateOne({ id }, { $set: { stock_quantity } });
    res.json({ success: true });
}));

// Preferences
router.get('/food/preferences', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const householdId = req.user.sub;
    const prefs = await FoodPreference.find({ household_id: householdId });
    
    const result = [];
    for (const p of prefs) {
        const item = await FoodInventory.findOne({ id: p.food_item_id });
        const pObj = p.toObject();
        pObj.food_item = item ? stripPrivateFields(item) : null;
        result.push(stripPrivateFields(pObj));
    }
    res.json(result);
}));

router.post('/food/preferences/toggle', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const householdId = req.user.sub;
    const { food_item_id, is_selected, default_quantity } = req.body;

    const item = await FoodInventory.findOne({ id: food_item_id });
    if (!item) {
        return res.status(404).json({ message: 'Food item not found', detail: 'Food item not found' });
    }

    let pref = await FoodPreference.findOne({ household_id: householdId, food_item_id });
    if (pref) {
        pref.is_selected = is_selected;
        if (default_quantity !== undefined) pref.default_quantity = default_quantity;
        await pref.save();
    } else {
        pref = await FoodPreference.create({
            id: newId(),
            household_id: householdId,
            food_item_id,
            is_selected,
            default_quantity: default_quantity || 1,
            unit: item.unit
        });
    }
    res.json(stripPrivateFields(pref));
}));

router.patch('/food/preferences/:id', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { id } = req.params;
    const update = {};
    const allowedFields = ['is_selected', 'default_quantity', 'pause_until'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            update[field] = req.body[field];
        }
    }
    await FoodPreference.updateOne({ id, household_id: req.user.sub }, { $set: update });
    res.json({ success: true });
}));

router.post('/food/preferences/pause', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const { pause_until } = req.body;
    await FoodPreference.updateMany({ household_id: req.user.sub }, { $set: { pause_until } });
    res.json({ success: true });
}));

// Orders
router.get('/food/orders/mine', getCurrentUser, asyncHandler(async (req, res) => {
    if (req.user.role !== 'User') {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const orders = await FoodOrder.find({ household_id: req.user.sub }).sort({ order_date: -1 }).limit(100);
    const result = [];
    for (const o of orders) {
        const item = await FoodInventory.findOne({ id: o.food_item_id });
        const oObj = o.toObject();
        oObj.food_item = item ? stripPrivateFields(item) : null;
        result.push(stripPrivateFields(oObj));
    }
    res.json(result);
}));

router.get('/food/orders/today', getCurrentUser, asyncHandler(async (req, res) => {
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized', detail: 'Not authorized' });
    }
    const today = new Date().toISOString().split('T')[0];
    const orders = await FoodOrder.find({ delivery_date: today });
    const result = [];
    for (const o of orders) {
        const item = await FoodInventory.findOne({ id: o.food_item_id });
        const oObj = o.toObject();
        oObj.food_item = item ? stripPrivateFields(item) : null;
        result.push(stripPrivateFields(oObj));
    }
    res.json(result);
}));

export default router;
