import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    is_read: { type: Boolean, default: false }
}, {
    timestamps: true
});

export default mongoose.model('Notification', notificationSchema, 'notifications');
