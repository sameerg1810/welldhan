import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    household_id: { type: String, required: true },
    member_name: { type: String, required: true },
    age: { type: Number, required: true },
    relation: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    assigned_sport: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    phone: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model('Member', memberSchema, 'members');
