import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';
import { generateOTP } from '../../../lib/otp'; // Utility to generate OTP
import axios from 'axios'; // For sending SMS via Fast2SMS
import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { phone_number, country_code, role_name } = req.body;

    // ✅ Step 1: Validate input
    if (!phone_number || !country_code || !role_name) {
      return sendResponse(res, false, {}, 'Phone number, country code, and role name are required', 400);
    }

    // ✅ Step 2: Check if the country code is valid for India
    if (country_code !== '+91' && country_code !== '91') {
      return sendResponse(res, false, {}, 'Only Indian phone numbers (+91) are allowed.', 400);
    }

    // ✅ Step 3: Ensure phone number contains only digits
    if (!/^\d+$/.test(phone_number)) {
      return sendResponse(res, false, {}, 'Invalid phone number format. Only digits are allowed.', 400);
    }

    // ✅ Step 4: Validate phone number length (must be exactly 10 digits)
    if (phone_number.length !== 10) {
      return sendResponse(res, false, {}, 'Invalid phone number length. Must be exactly 10 digits.', 400);
    }

    // ✅ Step 5: Ensure phone number starts with 6, 7, 8, or 9 (valid Indian mobile number pattern)
    if (!/^[6789]\d{9}$/.test(phone_number)) {
      return sendResponse(res, false, {}, 'Invalid Indian mobile number. Must start with 6, 7, 8, or 9.', 400);
    }

    // ✅ Step 6: Get role_id from role_name
    const role = await db.oneOrNone(`SELECT role_id FROM roles WHERE role_name = $1`, [role_name]);

    if (!role) {
      return sendResponse(res, false, {}, `Invalid role: ${role_name}`, 400);
    }

    const role_id = role.role_id;

    // ✅ Step 7: Generate OTP
    const otp = generateOTP();
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // ✅ Step 8: Check if the user exists with the given phone number
    let user = await db.oneOrNone(`SELECT id FROM users WHERE phone_number = $1`, [phone_number]);

    if (user) {
      // Update OTP for existing user
      await db.none(`UPDATE users SET otp = $1, otp_expiry = $2 WHERE phone_number = $3`, [otp, otp_expiry, phone_number]);
    } else {
      // ✅ Step 9: Create a new user and assign a role
      user = await db.one(
        `INSERT INTO users (phone_number, otp, otp_expiry, is_verified, status, created_at, updated_at) 
         VALUES ($1, $2, $3, FALSE, 'Active', NOW(), NOW()) 
         RETURNING id, phone_number, is_verified, status, created_at, updated_at`,
        [phone_number, otp, otp_expiry]
      );

      // Assign the role to the new user in `user_roles`
      await db.none(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [user.id, role_id]);
    }

    // ✅ Step 10: Send OTP via SMS API (e.g., Fast2SMS)
    await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      new URLSearchParams({
        variables_values: otp,
        route: 'otp',
        numbers: phone_number,
      }),
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY, // Store API key in .env
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // ✅ Step 11: Return success response
    return sendResponse(
      res,
      true,
      { country_code, phone_number, otp },
      '',
      0
    );
  } catch (error) {
    console.error('Error during login:', error);
    return sendResponse(res, false, {}, 'Failed to send OTP for login', 500);
  }
}