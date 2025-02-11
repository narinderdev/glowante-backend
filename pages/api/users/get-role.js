import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { user_id, phone_number } = req.body;

    if (!user_id && !phone_number) {
      return sendResponse(res, false, {}, 'Either user_id or phone_number is required', 400);
    }

    // Fetch user ID using phone number if only phone_number is provided
    let user;
    if (phone_number) {
      user = await db.oneOrNone('SELECT id FROM users WHERE phone_number = $1', [phone_number]);
      if (!user) {
        return sendResponse(res, false, {}, 'User not found', 404);
      }
    }

    const finalUserId = user_id || user.id;

    // Fetch role(s) of the user
    const roles = await db.manyOrNone(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.role_id 
       WHERE ur.user_id = $1`, 
      [finalUserId]
    );

    if (roles.length === 0) {
      return sendResponse(res, true, { roles: [] }, 'User has no assigned roles', 0);
    }

    return sendResponse(res, true, { roles }, 'User role(s) fetched successfully', 0);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return sendResponse(res, false, {}, 'Failed to fetch user role', 500);
  }
}