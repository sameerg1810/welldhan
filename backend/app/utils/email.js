import nodemailer from 'nodemailer';
import { settings } from '../core/config.js';

export const sendOtpEmail = async (toEmail, otp) => {
    if (!settings.gmailUser || !settings.gmailAppPassword) {
        console.log(`[DEV MODE] EMAIL OTP for ${toEmail}: ${otp}`);
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: settings.gmailUser,
            pass: settings.gmailAppPassword,
        },
    });

    const mailOptions = {
        from: settings.gmailUser,
        to: toEmail,
        subject: 'WELLDHAN — Your Login OTP',
        text: `Your WELLDHAN login OTP is: ${otp}. Expires in 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(`Email send error: ${error.message}`);
        return false;
    }
};
