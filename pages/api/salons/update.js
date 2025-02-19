import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { id, salon_name, address, city, state, country_code, phone_no, alternate_country_code, alternate_phone_no, email, opening_time, closing_time, salon_description, salon_picture_url } = req.body;

    if (!id) {
      return sendResponse(res, false, {}, 'Salon ID is required', 400);
    }

    const updatedSalon = await db.one(
      `UPDATE salons 
       SET salon_name = COALESCE($2, salon_name),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           state = COALESCE($5, state),
           country_code = COALESCE($6, country_code),
           phone_no = COALESCE($7, phone_no),
           alternate_country_code = COALESCE($8, alternate_country_code),
           alternate_phone_no = COALESCE($9, alternate_phone_no),
           email = COALESCE($10, email),
           opening_time = COALESCE($12, opening_time),
           closing_time = COALESCE($13, closing_time),
           salon_description = COALESCE($14, salon_description),
           salon_picture_url = COALESCE($15, salon_picture_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, salon_name, address, city, state, country_code, phone_no, alternate_country_code, alternate_phone_no, email, opening_time, closing_time, salon_description, salon_picture_url]
    );

    return sendResponse(res, true, updatedSalon, '');
  } catch (error) {
    console.error('Error updating salon:', error);
    return sendResponse(res, false, {}, 'Failed to update salon', 500);
  }
}