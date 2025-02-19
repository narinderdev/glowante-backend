import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { category_id, status } = req.body;

    if (!category_id || !status) {
      return sendResponse(res, false, {}, 'Category ID and status are required', 400);
    }

    // Ensure the status is valid (e.g., 'Active', 'Inactive')
    const validStatuses = ['Active', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, false, {}, 'Invalid status value', 400);
    }

    const updatedCategory = await db.one(
      `UPDATE category SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, category_id]
    );

    return sendResponse(res, true, updatedCategory, '', 200);
  } catch (error) {
    console.error('Error updating category status:', error);
    return sendResponse(res, false, {}, 'Failed to update category status', 500);
  }
}