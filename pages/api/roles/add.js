import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { role_name } = req.body;

    if (!role_name) {
      return sendResponse(res, false, {}, 'Role name is required', 400);
    }

    const role = await db.one(
      `INSERT INTO roles (role_name) VALUES ($1) RETURNING *`,
      [role_name]
    );

    return sendResponse(res, true, role, 'Role added successfully', 0);
  } catch (error) {
    console.error('Error inserting role:', error);
    return sendResponse(res, false, {}, 'Failed to add role', 500);
  }
}