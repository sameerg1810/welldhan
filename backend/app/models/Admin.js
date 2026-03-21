import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    passwordHash: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    role: { type: String, default: 'Admin' }
}, {
    timestamps: true
});

export default mongoose.model('Admin', adminSchema, 'admin_users');
