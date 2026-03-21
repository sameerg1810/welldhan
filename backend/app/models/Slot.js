import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    trainer_id: { type: String, required: true },
    community_id: { type: String, required: true },
    sport: { type: String, required: true },
    slot_time: { type: String, required: true },
    slot_days: { type: [String], required: true },
    max_capacity: { type: Number, required: true },
    current_booked: { type: Number, default: 0 },
    is_available: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    location: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('Slot', slotSchema, 'slots');
