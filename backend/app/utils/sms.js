import axios from 'axios';
import { settings } from '../core/config.js';
import { normalizePhone } from '../core/security.js';

export const sendOtpSms2Factor = async (toPhone, otp) => {
    const phone = normalizePhone(toPhone);
    if (!settings.twofactorApiKey || !settings.twofactorOtpTemplate) {
        console.log(`[DEV MODE] SMS OTP for ${phone}: ${otp}`);
        return false;
    }

    let url = `https://2factor.in/API/V1/${settings.twofactorApiKey}/SMS/${phone}/${otp}/${settings.twofactorOtpTemplate}`;
    if (settings.twofactorOtpSender) {
        url += `?From=${settings.twofactorOtpSender}`;
    }

    try {
        const response = await axios.get(url, { timeout: 10000 });
        if (response.data.Status?.toLowerCase() !== 'success') {
            throw new Error(`2Factor send failed: ${JSON.stringify(response.data)}`);
        }
        return true;
    } catch (error) {
        console.error(`2Factor SMS send error: ${error.message}`);
        return false;
    }
};
