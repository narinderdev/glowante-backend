import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { 
      salon_name, 
      address, 
      phone_no, 
      country_code,
      email, 
      salon_owner_id, 
      opening_time, 
      closing_time, 
      salon_description, 
      salon_picture_url, 
      city, 
      state, 
      alternate_phone_no, 
      alternate_country_code 
    } = req.body;

    // Check for required fields
    if (!salon_name || !email || !phone_no || !country_code || !opening_time || !closing_time || !address || !city || !state || !salon_owner_id) {
      return sendResponse(res, false, {}, 'Please fill all required fields', 400);
    }

    // Insert salon with optional fields (alternate_phone_no, alternate_country_code)
    const salon = await db.one(
      `INSERT INTO salons 
      (salon_name, address, phone_no, country_code, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url, city, state, alternate_phone_no, alternate_country_code) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [salon_name, address, phone_no, country_code, email, salon_owner_id, opening_time, closing_time, salon_description, salon_picture_url, city, state, alternate_phone_no || null, alternate_country_code || null]
    );

    // Send the response with the created salon data
    return sendResponse(res, true, salon);
  } catch (error) {
    console.error('Error inserting salon:', error);
    return sendResponse(res, false, {}, 'Failed to add salon', 500);
  }
}