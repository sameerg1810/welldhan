import mongoose from 'mongoose';

const smsOtpChallengeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    userId: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SmsOtpChallenge', smsOtpChallengeSchema, 'sms_otp_challenges');
