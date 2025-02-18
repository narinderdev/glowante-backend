import db from '../../../lib/db';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
    if (req.method === 'GET') {
      try {
        const users = await db.any(`
          SELECT 
            u.id AS user_id,
            u.first_name,
            u.last_name,
            u.email,
            u.country_code,
            u.phone_number,
            u.profile_picture_url,
            u.status AS user_status,
            r.role_name,
            ua.city,
            ua.state,
            ua.zipcode,
            ua.street,
            ua.status AS address_status
          FROM users u
          LEFT JOIN user_roles ur ON u.id = ur.user_id
          LEFT JOIN roles r ON ur.role_id = r.role_id
          LEFT JOIN user_addresses ua ON u.id = ua.user_id
        `);
  
        // Use the sendResponse function to send a consistent response
        return sendResponse(res, true, users);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Use sendResponse for error handling as well
        return sendResponse(res, false, {}, 'Internal Server Error', 500);
      }
    } else {
      return sendResponse(res, false, {}, 'Method Not Allowed', 405);
    }
  }