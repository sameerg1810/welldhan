import mongoose from 'mongoose';

const householdSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    community_id: { type: String, required: true },
    flat_number: { type: String, required: true },
    primary_name: { type: String, required: true },
    primary_phone: { type: String, required: true },
    primary_email: { type: String, required: true, unique: true },
    package_id: { type: String, required: true },
    plan_type: { type: String, enum: ['Family', 'Individual'], default: 'Individual' },
    total_members: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
    food_plan_active: { type: Boolean, default: false },
    join_date: { type: String, required: true },
    fcm_token: { type: String, default: '' },
    passwordHash: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model('Household', householdSchema, 'households');
