import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { category_id } = req.query;

    if (!category_id) {
      return sendResponse(res, false, {}, 'Category ID is required', 400);
    }

    const subcategories = await db.manyOrNone(
      `SELECT * FROM sub_category WHERE category_id = $1 ORDER BY created_at DESC`,
      [category_id]
    );

    return sendResponse(res, true, subcategories, 'Subcategories fetched successfully', 200);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return sendResponse(res, false, {}, 'Failed to fetch subcategories', 500);
  }
}