import db from '../../lib/db';
import { sendResponse } from '../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { id, type, status } = req.body;

    // Validate input
    if (!id || !type || !status) {
      return sendResponse(res, false, {}, 'Missing required fields', 400);
    }

    // Ensure status is either 'Active' or 'Inactive'
    const validStatuses = ['Active', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, false, {}, 'Invalid status value', 400);
    }

    let table;
    if (type === 'user') {
      table = 'users';
    } else if (type === 'salon') {
      table = 'salons';
    } else {
      return sendResponse(res, false, {}, 'Invalid type, must be "user" or "salon"', 400);
    }

    // Update status
    const result = await db.oneOrNone(
      `UPDATE ${table} SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (!result) {
      return sendResponse(res, false, {}, 'Record not found', 404);
    }

    return sendResponse(res, true, result);
  } catch (error) {
    console.error('Error updating status:', error);
    return sendResponse(res, false, {}, 'Failed to update status', 500);
  }
}