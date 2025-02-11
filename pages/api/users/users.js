import UserModel from '../../../models/UserModel';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await UserModel.getAllUsers();
      sendResponse(res, true, users);
    } catch (error) {
      sendResponse(res, false, {}, 'Failed to fetch users', 500, 500);
    }
  } else if (req.method === 'POST') {
    try {
      const { first_name, last_name, email, password, phone_number, country_code } = req.body;
      if (!first_name || !last_name || !email || !password || !phone_number || !country_code) {
        return sendResponse(res, false, {}, 'Missing required fields', 400, 400);
      }
      const newUser = await UserModel.createUser(first_name, last_name, email, password, phone_number, country_code);
      sendResponse(res, true, newUser, '', 0, 201);
    } catch (error) {
      sendResponse(res, false, {}, 'Error creating user', 500, 500);
    }
  } else {
    sendResponse(res, false, {}, 'Method not allowed', 405, 405);
  }
}