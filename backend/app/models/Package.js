import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    duration_days: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
    sport_limits: { type: Object, default: {} },
    other_benefits: { type: [String], default: [] }
}, {
    timestamps: true
});

export default mongoose.model('Package', packageSchema, 'packages');
