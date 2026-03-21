import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    household_id: { type: String, required: true },
    package_id: { type: String },
    amount_due: { type: Number, required: true },
    amount_paid: { type: Number, default: 0 },
    payment_date: { type: String },
    due_date: { type: String, required: true },
    month_year: { type: String, required: true },
    is_paid: { type: Boolean, default: false },
    payment_method: { type: String },
    upi_transaction_id: { type: String },
    payer_upi_id: { type: String },
    is_overdue: { type: Boolean, default: false },
    type: { type: String, enum: ['Subscription', 'Food'], required: true }
}, {
    timestamps: true
});

export default mongoose.model('Payment', paymentSchema, 'payments');
