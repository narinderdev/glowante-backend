import db from '../../../lib/db';
import { generateOTP } from '../../../lib/otp';
import { sendResponse } from '../../../lib/response';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { userType, phone_number, country_code } = req.body;

    if (!phone_number || !country_code) {
      return sendResponse(res, false, {}, 'Phone number and country code are required', 400);
    }

    // Ensure country code is +91 for India
    if (country_code !== "+91") {
      return sendResponse(res, false, {}, 'Only Indian phone numbers are supported', 400);
    }

    const otp = generateOTP();
    console.log("Generated OTP:", otp);

    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Check if the user exists
    let user = await db.oneOrNone('SELECT * FROM users WHERE phone_number = $1', [phone_number]);

    if (user) {
      // Update OTP for existing user
      await db.none('UPDATE users SET otp = $1, otp_expiry = $2 WHERE phone_number = $3', [otp, otp_expiry, phone_number]);
    } else {
      // Create a new user with OTP
      user = await db.one(
        `INSERT INTO users (phone_number, otp, otp_expiry, is_verified, status) 
         VALUES ($1, $2, $3, FALSE, 'Active') RETURNING *`,
        [phone_number, otp, otp_expiry]
      );
    }

    // **Send OTP via Fast2SMS API**
    const smsResponse = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      new URLSearchParams({
        variables_values: otp,
        route: "otp",
        numbers: phone_number,  // Only the phone number, without country code
      }),
      {
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY, // Store API key in .env
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    console.log(`Fast2SMS Response:`, smsResponse.data);

    return sendResponse(res, true, { country_code, phone_number, otp }, 'OTP Sent Successfully', 0);
  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    return sendResponse(res, false, {}, 'Failed to send OTP', 500);
  }
}