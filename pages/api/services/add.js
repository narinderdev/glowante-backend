import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { service_name, description } = req.body;

    if (!service_name) {
      return sendResponse(res, false, {}, 'Service name is required', 400);
    }

    const service = await db.one(
      `INSERT INTO services (service_name, description) VALUES ($1, $2) RETURNING *`,
      [service_name, description]
    );

    return sendResponse(res, true, service, 'Service added successfully', 0);
  } catch (error) {
    console.error('Error inserting service:', error);
    return sendResponse(res, false, {}, 'Failed to add service', 500);
  }
}