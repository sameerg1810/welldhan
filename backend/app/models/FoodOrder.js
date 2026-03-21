import mongoose from 'mongoose';

const foodOrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    household_id: { type: String, required: true },
    food_item_id: { type: String, required: true },
    quantity: { type: Number, required: true },
    order_date: { type: String, required: true },
    delivery_date: { type: String, required: true },
    delivery_time: { type: String, default: '07:00 AM' },
    delivery_status: { type: String, enum: ['Scheduled', 'Delivered', 'Missed', 'Skipped'], default: 'Scheduled' },
    payment_status: { type: String, enum: ['Included', 'Paid', 'Pending'], default: 'Included' }
}, {
    timestamps: true
});

export default mongoose.model('FoodOrder', foodOrderSchema, 'food_orders');
