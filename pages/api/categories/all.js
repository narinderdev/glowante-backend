import CategoryModel from '../../../models/CategoryModel';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }
  try {
    const category = await CategoryModel.getAllCategory();
    sendResponse(res, true, category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return sendResponse(res, false, {}, 'Failed to fetch category', 500);
  }
}