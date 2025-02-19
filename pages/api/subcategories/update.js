import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { subcategory_id, category_id, name, description } = req.body;

    if (!subcategory_id || !category_id || !name) {
      return sendResponse(res, false, {}, 'Subcategory ID, Category ID, and name are required', 400);
    }

    const updatedSubcategory = await db.one(
      `UPDATE sub_category SET category_id = $1, name = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [category_id, name, description, subcategory_id]
    );

    return sendResponse(res, true, updatedSubcategory, 'Subcategory updated successfully', 200);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return sendResponse(res, false, {}, 'Failed to update subcategory', 500);
  }
}