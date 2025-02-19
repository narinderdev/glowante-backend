import db from '../../../../lib/db';
import { sendResponse } from '../../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { service_id, salon_id, category_id, sub_category_id, price, duration, description } = req.body;

    if (!service_id) {
      return sendResponse(res, false, {}, 'Service ID is required', 400);
    }

    // Check if service exists
    const existingService = await db.oneOrNone(`SELECT * FROM salon_services WHERE id = $1`, [service_id]);

    if (!existingService) {
      return sendResponse(res, false, {}, 'Service not found', 404);
    }

    // Update salon service with provided fields
    const updatedService = await db.one(
      `UPDATE salon_services 
       SET 
         salon_id = COALESCE($2, salon_id), 
         category_id = COALESCE($3, category_id), 
         sub_category_id = COALESCE($4, sub_category_id), 
         price = COALESCE($5, price), 
         duration = COALESCE($6, duration), 
         description = COALESCE($7, description), 
         updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [service_id, salon_id, category_id, sub_category_id, price, duration, description]
    );

    return sendResponse(res, true, updatedService, '', 200);
  } catch (error) {
    console.error('Error updating salon service:', error);
    return sendResponse(res, false, {}, 'Failed to update salon service', 500);
  }
}