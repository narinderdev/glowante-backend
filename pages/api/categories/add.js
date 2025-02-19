import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { name, description } = req.body;

    if (!name) {
      return sendResponse(res, false, {}, 'Category name is required', 400);
    }

    const category = await db.one(
      `INSERT INTO category (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );

    return sendResponse(res, true, category, '', 0);
  } catch (error) {
    console.error('Error inserting category:', error);
    return sendResponse(res, false, {}, 'Failed to add category', 500);
  }
}