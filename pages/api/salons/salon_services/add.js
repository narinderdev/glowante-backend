import db from '../../../../lib/db';
import { sendResponse } from '../../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { salon_id, service_id, subservice_id, price, duration, description } = req.body;

    if (!salon_id || !service_id || !subservice_id || !price || !duration) {
      return sendResponse(res, false, {}, 'Missing required fields', 400);
    }

    const salon_service = await db.one(
      `INSERT INTO salon_services (salon_id, service_id, subservice_id, price, duration, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [salon_id, service_id, subservice_id, price, duration, description]
    );

    return sendResponse(res, true, salon_service, 'Salon service added successfully', 0);
  } catch (error) {
    console.error('Error inserting salon service:', error);
    return sendResponse(res, false, {}, 'Failed to add salon service', 500);
  }
}