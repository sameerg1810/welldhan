import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    community_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    sport: { type: String, required: true },
    certification: { type: String, default: '' },
    experience_years: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    salary: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    join_date: { type: String, required: true },
    fcm_token: { type: String, default: '' },
    image_url: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('Trainer', trainerSchema, 'trainers');
