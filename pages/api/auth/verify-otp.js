import db from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../../../lib/response';
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { phone_number, country_code, otp } = req.body;

    // Validate input
    if (!phone_number || !country_code || !otp) {
      return sendResponse(res, false, {}, 'Phone number, country code, and OTP are required', 400);
    }

    // Fetch user by phone number and country code
    const user = await db.oneOrNone('SELECT * FROM users WHERE phone_number = $1', [phone_number]);

    if (!user) {
      return sendResponse(res, false, {}, 'User not found', 404);
    }

    // Validate OTP
    if (user.otp !== otp) {
      return sendResponse(res, false, {}, 'Invalid OTP', 401);
    }

    if (new Date(user.otp_expiry) < new Date()) {
      return sendResponse(res, false, {}, 'OTP Expired', 401);
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user_id: user.id, phone_number: user.phone_number, country_code },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clear OTP after successful verification
    await db.none('UPDATE users SET otp = NULL, otp_expiry = NULL, is_verified = TRUE WHERE phone_number = $1', [phone_number]);

    return sendResponse(res, true, { token, country_code, phone_number }, 'OTP Verified Successfully', 0);
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return sendResponse(res, false, {}, 'Failed to verify OTP', 500);
  }
}