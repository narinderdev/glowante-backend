import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { service_id, subservice_name, subservice_description } = req.body;

    if (!service_id || !subservice_name) {
      return sendResponse(res, false, {}, 'Service ID and Subservice name are required', 400);
    }

    const subservice = await db.one(
      `INSERT INTO subservices (service_id, subservice_name, subservice_description) VALUES ($1, $2, $3) RETURNING *`,
      [service_id, subservice_name, subservice_description]
    );

    return sendResponse(res, true, subservice, 'Subservice added successfully', 0);
  } catch (error) {
    console.error('Error inserting subservice:', error);
    return sendResponse(res, false, {}, 'Failed to add subservice', 500);
  }
}