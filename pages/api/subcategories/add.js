import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { category_id, name, description } = req.body;

    if (!category_id || !name) {
      return sendResponse(res, false, {}, 'Cagtegory ID and Sub-category name are required', 400);
    }

    const subcategory = await db.one(
      `INSERT INTO sub_category (category_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [category_id, name, description]
    );

    return sendResponse(res, true, subcategory, '', 0);
  } catch (error) {
    console.error('Error inserting subcategory:', error);
    return sendResponse(res, false, {}, 'Failed to add subcategory', 500);
  }
}