import express from 'express';
import crypto from 'crypto';
import { settings } from '../../core/config.js';
import { genOtp, maskPhone, otpHmac, createToken } from '../../core/security.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import SmsOtpChallenge from '../../models/SmsOtpChallenge.js';
import Household from '../../models/Household.js';
import Trainer from '../../models/Trainer.js';
import Community from '../../models/Community.js';
import Admin from '../../models/Admin.js';
import Package from '../../models/Package.js';
import { sendOtpSms2Factor } from '../../utils/sms.js';
import { stripPrivateFields } from '../../utils/helpers.js';

const router = express.Router();

router.post('/2fa/sms/send-otp', asyncHandler(async (req, res) => {
    const { challenge_id } = req.body;
    const ch = await SmsOtpChallenge.findOne({ id: challenge_id, used: false });
    if (!ch) {
        return res.status(404).json({ message: 'No active 2FA challenge. Please login again.', detail: 'No active 2FA challenge. Please login again.' });
    }
    if (new Date() > ch.expiresAt) {
        return res.status(400).json({ message: 'Challenge expired. Please login again.', detail: 'Challenge expired. Please login again.' });
    }

    const otp = genOtp();
    ch.otpHash = otpHmac(ch.id, ch.phone, otp);
    ch.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    ch.attempts = 0;
    ch.createdAt = new Date();
    await ch.save();

    const smsSent = await sendOtpSms2Factor(ch.phone, otp);
    const resp = {
        success: true,
        challenge_id: ch.id,
        masked_phone: maskPhone(ch.phone),
        sms_sent: smsSent,
    };

    if (!settings.twofactorApiKey) {
        resp.otp_dev = otp;
    }
    res.json(resp);
}));

router.post('/2fa/sms/verify-otp', asyncHandler(async (req, res) => {
    const { challenge_id, otp } = req.body;
    const ch = await SmsOtpChallenge.findOne({ id: challenge_id, used: false });
    if (!ch) {
        return res.status(400).json({ message: 'No active 2FA challenge. Please login again.', detail: 'No active 2FA challenge. Please login again.' });
    }
    if (new Date() > ch.expiresAt) {
        return res.status(400).json({ message: 'OTP has expired. Please login again.', detail: 'OTP has expired. Please login again.' });
    }
    if (ch.attempts >= 5) {
        return res.status(429).json({ message: 'Too many attempts. Please login again.', detail: 'Too many attempts. Please login again.' });
    }

    const expected = ch.otpHash;
    const got = otpHmac(ch.id, ch.phone, otp);

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got))) {
        ch.attempts += 1;
        await ch.save();
        return res.status(400).json({ message: 'Invalid OTP. Please try again.', detail: 'Invalid OTP. Please try again.' });
    }

    ch.used = true;
    await ch.save();

    const { role, userId } = ch;
    const token = createToken(userId, role);

    let userData = null;
    if (role === 'User') {
        const hh = await Household.findOne({ id: userId });
        if (hh) {
            const pkg = await Package.findOne({ id: hh.package_id });
            const comm = await Community.findOne({ id: hh.community_id });
            const hhObj = hh.toObject();
            hhObj.package = pkg ? stripPrivateFields(pkg) : null;
            hhObj.community = comm ? stripPrivateFields(comm) : null;
            userData = stripPrivateFields(hhObj);
        }
    } else if (role === 'Trainer') {
        const t = await Trainer.findOne({ id: userId });
        if (t) userData = stripPrivateFields(t);
    } else if (role === 'Manager') {
        const c = await Community.findOne({ id: userId });
        if (c) userData = stripPrivateFields(c);
    } else if (role === 'Admin') {
        const a = await Admin.findOne({ id: userId });
        if (a) userData = stripPrivateFields(a);
    }

    res.json({ token, role, user_id: userId, user_data: userData });
}));

export default router;
