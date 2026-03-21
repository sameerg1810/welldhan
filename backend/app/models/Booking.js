import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    household_id: { type: String, required: true },
    member_id: { type: String, required: true },
    slot_id: { type: String, required: true },
    trainer_id: { type: String, required: true },
    session_date: { type: String, required: true },
    status: { type: String, enum: ['Confirmed', 'Cancelled', 'Attended', 'NoShow'], default: 'Confirmed' },
    booked_on: { type: String, required: true },
    notes: { type: String, default: '' }
}, {
    timestamps: true
});

export default mongoose.model('Booking', bookingSchema, 'bookings');
