import express from 'express';
import { newId, stripPrivateFields } from '../../utils/helpers.js';
import { genOtp, hashPassword, maskPhone, normalizePhone, otpHmac, verifyPassword, createToken } from '../../core/security.js';
import { settings } from '../../core/config.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import Admin from '../../models/Admin.js';
import Trainer from '../../models/Trainer.js';
import Community from '../../models/Community.js';
import Household from '../../models/Household.js';
import Member from '../../models/Member.js';
import Package from '../../models/Package.js';
import SmsOtpChallenge from '../../models/SmsOtpChallenge.js';
import { sendOtpSms2Factor } from '../../utils/sms.js';

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    let role = null;
    let userId = null;
    let userDoc = null;
    let phone = null;

    // Check Admin
    const admin = await Admin.findOne({ email: cleanEmail });
    if (admin) {
        if (await verifyPassword(password, admin.passwordHash)) {
            role = 'Admin';
            userId = admin.id;
            userDoc = admin;
            phone = admin.phone;
        } else {
            return res.status(401).json({ message: 'Invalid email or password', detail: 'Invalid email or password' });
        }
    }

    // Check Trainer
    if (!role) {
        const trainer = await Trainer.findOne({ email: cleanEmail });
        if (trainer) {
            if (await verifyPassword(password, trainer.passwordHash)) {
                role = 'Trainer';
                userId = trainer.id;
                userDoc = trainer;
                phone = trainer.phone;
            } else {
                return res.status(401).json({ message: 'Invalid email or password', detail: 'Invalid email or password' });
            }
        }
    }

    // Check Community Manager
    if (!role) {
        const community = await Community.findOne({ manager_email: cleanEmail });
        if (community) {
            if (await verifyPassword(password, community.passwordHash)) {
                role = 'Manager';
                userId = community.id;
                userDoc = community;
                phone = community.manager_phone;
            } else {
                return res.status(401).json({ message: 'Invalid email or password', detail: 'Invalid email or password' });
            }
        }
    }

    // Check Household User
    if (!role) {
        const household = await Household.findOne({ primary_email: cleanEmail });
        if (household) {
            if (await verifyPassword(password, household.passwordHash)) {
                role = 'User';
                userId = household.id;
                userDoc = household;
                phone = household.primary_phone;
            } else {
                return res.status(401).json({ message: 'Invalid email or password', detail: 'Invalid email or password' });
            }
        }
    }

    if (!role || !userId || !userDoc) {
        return res.status(401).json({ message: 'No account found with this email address', detail: 'No account found with this email address' });
    }
    if (!phone) {
        return res.status(400).json({ message: 'No phone number registered for this account', detail: 'No phone number registered for this account' });
    }

    const challengeId = newId();
    const otp = genOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await SmsOtpChallenge.create({
        id: challengeId,
        phone: normalizePhone(phone),
        role,
        userId,
        otpHash: otpHmac(challengeId, phone, otp),
        expiresAt,
        attempts: 0,
        used: false,
    });

    const smsSent = await sendOtpSms2Factor(phone, otp);
    const resp = {
        requires_2fa: true,
        challenge_id: challengeId,
        masked_phone: maskPhone(phone),
        sms_sent: smsSent,
        role,
    };

    if (!settings.twofactorApiKey) {
        resp.otp_dev = otp;
    }

    res.json(resp);
}));

router.post('/signup', asyncHandler(async (req, res) => {
    const { full_name, email, password, confirm_password, phone, flat_number } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match', detail: 'Passwords do not match' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters', detail: 'Password must be at least 6 characters' });
    }
    if (!full_name.trim()) {
        return res.status(400).json({ message: 'Full name is required', detail: 'Full name is required' });
    }

    const existing = await Household.findOne({ primary_email: cleanEmail });
    if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists', detail: 'An account with this email already exists' });
    }

    const community = await Community.findOne({});
    if (!community) {
        return res.status(500).json({ message: 'No community configured. Please contact admin.', detail: 'No community configured. Please contact admin.' });
    }

    let packageDoc = await Package.findOne({ name: 'Sport Basic', is_active: true });
    if (!packageDoc) {
        packageDoc = await Package.findOne({ is_active: true });
    }
    if (!packageDoc) {
        return res.status(500).json({ message: 'No active packages configured. Please contact admin.', detail: 'No active packages configured. Please contact admin.' });
    }

    const hhId = newId();
    const household = await Household.create({
        id: hhId,
        community_id: community.id,
        flat_number: flat_number.trim().toUpperCase(),
        primary_name: full_name.trim(),
        primary_phone: normalizePhone(phone),
        primary_email: cleanEmail,
        package_id: packageDoc.id,
        plan_type: 'Individual',
        total_members: 1,
        is_active: true,
        food_plan_active: false,
        join_date: new Date().toISOString().split('T')[0],
        fcm_token: '',
        passwordHash: await hashPassword(password),
    });

    await Member.create({
        id: newId(),
        household_id: hhId,
        member_name: full_name.trim(),
        age: 25,
        relation: 'Self',
        is_primary: true,
        assigned_sport: 'Badminton',
        is_active: true,
        phone: household.primary_phone,
    });

    const hhClean = stripPrivateFields(household);
    hhClean.package = stripPrivateFields(packageDoc);
    hhClean.community = stripPrivateFields(community);

    res.json({
        token: createToken(hhId, 'User'),
        role: 'User',
        user_id: hhId,
        user_data: hhClean
    });
}));

router.post('/signup/trainer', asyncHandler(async (req, res) => {
    const { name, email, phone, sport, community_id, password, confirm_password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match', detail: 'Passwords do not match' });
    }

    const existing = await Trainer.findOne({ email: cleanEmail });
    if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists', detail: 'An account with this email already exists' });
    }

    const tId = newId();
    const trainer = await Trainer.create({
        id: tId,
        community_id,
        name: name.trim(),
        email: cleanEmail,
        phone: normalizePhone(phone),
        sport: sport.trim(),
        is_active: true,
        join_date: new Date().toISOString().split('T')[0],
        passwordHash: await hashPassword(password),
    });

    res.json({
        token: createToken(tId, 'Trainer'),
        role: 'Trainer',
        user_id: tId,
        user_data: stripPrivateFields(trainer)
    });
}));

router.post('/signup/manager', asyncHandler(async (req, res) => {
    const { manager_name, manager_email, manager_phone, community_id, password, confirm_password } = req.body;
    const cleanEmail = manager_email.trim().toLowerCase();

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match', detail: 'Passwords do not match' });
    }

    const existing = await Community.findOne({ manager_email: cleanEmail });
    if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists', detail: 'An account with this email already exists' });
    }

    // Usually manager is tied to a community. If community doesn't exist, create it or fail.
    // For now, let's update existing or create new.
    let community = await Community.findOne({ id: community_id });
    if (!community) {
        community = await Community.create({
            id: community_id || newId(),
            name: 'New Community',
            manager_name: manager_name.trim(),
            manager_phone: normalizePhone(manager_phone),
            manager_email: cleanEmail,
            address: 'Pending',
            city: 'Pending',
            pincode: '000000',
            is_active: true,
            passwordHash: await hashPassword(password),
        });
    } else {
        community.manager_name = manager_name.trim();
        community.manager_phone = normalizePhone(manager_phone);
        community.manager_email = cleanEmail;
        community.passwordHash = await hashPassword(password);
        await community.save();
    }

    res.json({
        token: createToken(community.id, 'Manager'),
        role: 'Manager',
        user_id: community.id,
        user_data: stripPrivateFields(community)
    });
}));

router.post('/send-otp', asyncHandler(async (req, res) => {
    const { phone } = req.body;
    const cleanPhone = normalizePhone(phone);

    let role = null;
    let userId = null;
    let userDoc = null;

    // Search for user by phone
    const household = await Household.findOne({ primary_phone: cleanPhone });
    if (household) {
        role = 'User';
        userId = household.id;
        userDoc = household;
    } else {
        const trainer = await Trainer.findOne({ phone: cleanPhone });
        if (trainer) {
            role = 'Trainer';
            userId = trainer.id;
            userDoc = trainer;
        } else {
            const admin = await Admin.findOne({ phone: cleanPhone });
            if (admin) {
                role = 'Admin';
                userId = admin.id;
                userDoc = admin;
            }
        }
    }

    if (!role || !userId) {
        return res.status(404).json({ message: 'No account found with this phone number', detail: 'No account found with this phone number' });
    }

    const challengeId = newId();
    const otp = genOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await SmsOtpChallenge.create({
        id: challengeId,
        phone: cleanPhone,
        role,
        userId,
        otpHash: otpHmac(challengeId, cleanPhone, otp),
        expiresAt,
        attempts: 0,
        used: false,
    });

    const smsSent = await sendOtpSms2Factor(cleanPhone, otp);
    const resp = {
        success: true,
        challenge_id: challengeId,
        masked_phone: maskPhone(cleanPhone),
        sms_sent: smsSent,
    };

    if (!settings.twofactorApiKey) {
        resp.otp_dev = otp;
    }

    res.json(resp);
}));

export default router;
