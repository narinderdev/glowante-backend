import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone_number, 
      profile_picture_url, 
      country_code, 
      role_name,
      address
    } = req.body;

    // Validate required input fields
    if (!first_name || !last_name || !country_code || !phone_number || !role_name) {
      return sendResponse(res, false, {}, 'Please fill all required fields', 400);
    }

    // Check if user already exists
    const existingUserEmail = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUserEmail) {
      return sendResponse(res, false, {}, 'User with this email already exists', 409);
    }
    const existingUserPhone = await db.oneOrNone('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (existingUserPhone) {
      return sendResponse(res, false, {}, 'User with this phone number already exists', 409);
    }

    // ✅ Step 1: Get role_id from role_name
    const role = await db.oneOrNone(`SELECT role_id FROM roles WHERE role_name = $1`, [role_name]);

    if (!role) {
      return sendResponse(res, false, {}, `Invalid role: ${role_name}`, 400);
    }

    const role_id = role.role_id;

    // ✅ Step 2: Insert user into the database
    const newUser = await db.one(
      `INSERT INTO users (first_name, last_name, email, country_code, phone_number, profile_picture_url, status, is_verified, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Active', FALSE, NOW(), NOW()) 
       RETURNING id, first_name, last_name, email, country_code, phone_number, profile_picture_url, status, is_verified`,
      [first_name, last_name, email, country_code, phone_number, profile_picture_url]
    );

    // ✅ Step 3: Assign the role to the new user in user_roles
    await db.none(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [newUser.id, role_id]);

    // ✅ Step 4: Insert Address (only if provided)
    let updatedAddress = null;
    if (address) {
      const { city, state, zipcode, street } = address;
      updatedAddress = await db.one(
        `INSERT INTO user_addresses (user_id, street, city, state, zipcode, status, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, 'Active', NOW(), NOW())
         RETURNING street, city, state, zipcode, status`,
        [newUser.id, street || null, city || null, state || null, zipcode || null]
      );
    }

    return sendResponse(res, true, { ...newUser, address: updatedAddress }, '', 0, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return sendResponse(res, false, {}, 'Error creating user', 500);
  }
}