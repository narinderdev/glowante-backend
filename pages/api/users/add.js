import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { first_name, last_name, email, password, phone_number, profile_picture_url, country_code } = req.body;

    // Validate input
    if (!first_name || !last_name || !email || !password || !phone_number || !country_code) {
      return sendResponse(res, false, {}, 'All fields are required', 400);
    }

    // Check if user already exists
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1 OR phone_number = $2', [email, phone_number]);
    if (existingUser) {
      return sendResponse(res, false, {}, 'User with this email or phone number already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const newUser = await db.one(
      `INSERT INTO users (first_name, last_name, email, password, phone_number, profile_picture_url, status, is_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', FALSE, NOW(), NOW()) RETURNING id, first_name, last_name, email, phone_number, profile_picture_url, status, is_verified`,
      [first_name, last_name, email, hashedPassword, phone_number, profile_picture_url]
    );

    return sendResponse(res, true, newUser, 'User created successfully', 0, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return sendResponse(res, false, {}, 'Error creating user', 500);
  }
}
