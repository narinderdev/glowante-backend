import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url } = req.body;

    if (!salon_name || !address || !phone_no || !salon_owner_id || !opening_time || !closing_time) {
      return sendResponse(res, false, {}, 'Missing required fields', 400);
    }

    const salon = await db.one(
      `INSERT INTO salons (salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [salon_name, address, phone_no, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url]
    );

    return sendResponse(res, true, salon, 'Salon added successfully', 0);
  } catch (error) {
    console.error('Error inserting salon:', error);
    return sendResponse(res, false, {}, 'Failed to add salon', 500);
  }
}