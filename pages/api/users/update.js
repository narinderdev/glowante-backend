import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { id, first_name, last_name, email, phone_number, profile_picture_url, country_code, role_name, address } = req.body;

    if (!id) {
      return sendResponse(res, false, {}, 'User ID is required', 400);
    }

    // ✅ Step 1: Fetch current user details
    const existingUser = await db.oneOrNone(`SELECT * FROM users WHERE id = $1`, [id]);
    if (!existingUser) {
      return sendResponse(res, false, {}, 'User not found', 404);
    }

    // ✅ Step 2: Check for role update
    let role_id = null;
    if (role_name) {
      const role = await db.oneOrNone(`SELECT role_id FROM roles WHERE role_name = $1`, [role_name]);
      if (!role) {
        return sendResponse(res, false, {}, `Invalid role: ${role_name}`, 400);
      }
      role_id = role.role_id;
    }

    // ✅ Step 3: Update user details
    const updatedUser = await db.one(
      `UPDATE users 
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           email = COALESCE($4, email),
           country_code = COALESCE($5, country_code),
           phone_number = COALESCE($6, phone_number),
           profile_picture_url = COALESCE($7, profile_picture_url),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, first_name, last_name, email, country_code, phone_number, profile_picture_url`,
      [id, first_name, last_name, email, country_code, phone_number, profile_picture_url]
    );

    // ✅ Step 4: Update role if changed
    if (role_id) {
      await db.none(`UPDATE user_roles SET role_id = $1 WHERE user_id = $2`, [role_id, id]);
    }

    // ✅ Step 5: Update Address if provided
    if (address) {
      const { street, city, state, zipcode } = address;
      const existingAddress = await db.oneOrNone(`SELECT * FROM user_addresses WHERE user_id = $1`, [id]);

      if (existingAddress) {
        // Update existing address
        await db.none(
          `UPDATE user_addresses 
           SET street = COALESCE($2, street),
               city = COALESCE($3, city),
               state = COALESCE($4, state),
               zipcode = COALESCE($5, zipcode),
               updated_at = NOW()
           WHERE user_id = $1`,
          [id, street, city, state, zipcode]
        );
      } else {
        // Insert new address
        await db.none(
          `INSERT INTO user_addresses (user_id, street, city, state, zipcode, status, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, 'Active', NOW(), NOW())`,
          [id, street, city, state, zipcode]
        );
      }
    }

    return sendResponse(res, true, updatedUser, 'User updated successfully');
  } catch (error) {
    console.error('Error updating user:', error);
    return sendResponse(res, false, {}, 'Error updating user', 500);
  }
}