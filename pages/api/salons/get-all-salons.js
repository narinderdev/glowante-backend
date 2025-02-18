import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    // Query to get all salons with related data (e.g., salon owner and other columns)
    const salons = await db.any(`
      SELECT 
        s.id AS salon_id,
        s.salon_name,
        s.address,
        s.city,
        s.state,
        s.country_code,
        s.phone_no,
        s.alternate_phone_no,
        s.email,
        s.salon_owner_id,
        s.opening_time,
        s.closing_time,
        s.salon_description,
        s.salon_picture_url,
        s.created_at,
        s.updated_at,
        s.status AS salon_status,
        s.alternate_country_code,
        u.first_name AS salon_owner_first_name,
        u.last_name AS salon_owner_last_name
      FROM salons s
      LEFT JOIN users u ON s.salon_owner_id = u.id
    `);

    // Return the salons data
    return sendResponse(res, true, salons);
  } catch (error) {
    console.error('Error fetching salons:', error);
    return sendResponse(res, false, {}, 'Failed to fetch salons', 500);
  }
}