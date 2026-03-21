import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manager_name: { type: String, required: true },
    manager_phone: { type: String, required: true },
    manager_email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    is_active: { type: Boolean, default: true },
    fcm_token: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('Community', communitySchema, 'communities');
