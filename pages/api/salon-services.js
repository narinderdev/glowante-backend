import db from '../../lib/db';
import { sendResponse } from '../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const salon_services = await db.manyOrNone(`
      SELECT ss.id, ss.salon_id, s.salon_name, 
             ss.category_id, c.name AS category_name, 
             ss.sub_category_id, sc.name AS sub_category_name, 
             ss.price, ss.duration, ss.description, 
             ss.created_at, ss.updated_at
      FROM salon_services ss
      JOIN salons s ON ss.salon_id = s.id
      JOIN category c ON ss.category_id = c.id
      JOIN sub_category sc ON ss.sub_category_id = sc.id
      ORDER BY ss.created_at DESC
    `);

    return sendResponse(res, true, salon_services, '', 200);
  } catch (error) {
    console.error('Error fetching salon services:', error);
    return sendResponse(res, false, {}, 'Failed to fetch salon services', 500);
  }
}