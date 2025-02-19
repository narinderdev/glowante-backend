import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { id, name, description } = req.body;

    if (!id || !name) {
      return sendResponse(res, false, {}, 'Category ID and name are required', 400);
    }

    const updatedCategory = await db.one(
      `UPDATE category SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    return sendResponse(res, true, updatedCategory, '', 200);
  } catch (error) {
    console.error('Error updating category:', error);
    return sendResponse(res, false, {}, 'Failed to update category', 500);
  }
}