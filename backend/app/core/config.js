import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../');
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

export const settings = {
    mongoUrl: process.env.MONGO_URL,
    dbName: process.env.DB_NAME || 'welldhan_db',
    jwtSecret: process.env.JWT_SECRET || 'welldhan-secret-key',
    jwtAlgorithm: 'HS256',
    jwtExpireDays: 30,
    gmailUser: process.env.GMAIL_USER || '',
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
    otpHmacSecret: process.env.OTP_HMAC_SECRET || process.env.JWT_SECRET || 'welldhan-secret-key',
    twofactorApiKey: process.env.TWOFACTOR_API_KEY || '',
    twofactorOtpTemplate: process.env.TWOFACTOR_OTP_TEMPLATE || '',
    twofactorOtpSender: process.env.TWOFACTOR_OTP_SENDER || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
};

export const getSettings = () => settings;
