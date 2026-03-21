import mongoose from 'mongoose';

const foodInventorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Vegetable', 'Oil', 'Grain', 'Dairy', 'Spice'], required: true },
    unit: { type: String, required: true },
    price_per_unit: { type: Number, required: true },
    stock_quantity: { type: Number, default: 0 },
    reorder_level: { type: Number, default: 10 },
    is_organic: { type: Boolean, default: true },
    is_available: { type: Boolean, default: true },
    supplier_name: { type: String, default: 'WELLDHAN Organic' },
    image_url: { type: String, default: '' },
    community_id: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model('FoodInventory', foodInventorySchema, 'food_inventory');
