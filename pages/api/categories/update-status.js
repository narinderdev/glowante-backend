import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const categories = await db.manyOrNone(`SELECT * FROM category ORDER BY created_at DESC`);
    return sendResponse(res, true, categories, '', 200);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return sendResponse(res, false, {}, 'Failed to fetch categories', 500);
  }
}