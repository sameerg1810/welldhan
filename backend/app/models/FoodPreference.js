import mongoose from 'mongoose';

const foodPreferenceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    household_id: { type: String, required: true },
    member_id: { type: String },
    food_item_id: { type: String, required: true },
    is_selected: { type: Boolean, default: true },
    default_quantity: { type: Number, default: 1 },
    unit: { type: String, required: true },
    pause_until: { type: String }
}, {
    timestamps: true
});

export default mongoose.model('FoodPreference', foodPreferenceSchema, 'food_preferences');
