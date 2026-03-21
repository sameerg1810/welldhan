import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { settings } from './config.js';

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (plain, hashed) => {
    try {
        return await bcrypt.compare(plain, hashed);
    } catch (error) {
        return false;
    }
};

export const genOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const normalizePhone = (phone) => {
    return phone.trim().replace('+91', '').replace(/\s/g, '').replace(/-/g, '');
};

export const maskPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) {
        return '***';
    }
    return `${digits.substring(0, 2)}******${digits.substring(digits.length - 2)}`;
};

export const otpHmac = (challengeId, phone, otp) => {
    const msg = `${challengeId}|${normalizePhone(phone)}|${otp.trim()}`;
    return crypto
        .createHmac('sha256', settings.otpHmacSecret)
        .update(msg)
        .digest('hex');
};

export const createToken = (sub, role) => {
    const payload = {
        sub: sub,
        role: role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + settings.jwtExpireDays * 24 * 60 * 60,
    };
    return jwt.sign(payload, settings.jwtSecret, { algorithm: settings.jwtAlgorithm });
};

export const decodeToken = (token) => {
    return jwt.verify(token, settings.jwtSecret, { algorithms: [settings.jwtAlgorithm] });
};
