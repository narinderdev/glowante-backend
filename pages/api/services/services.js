import ServiceModel from '../../../models/ServiceModel';
import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const services = await ServiceModel.getAllServices();
      sendResponse(res, true, services);
    } catch (error) {
      console.error('Error fetching services:', error);
      return sendResponse(res, false, {}, 'Failed to fetch services', 500);
    }
  } else if (req.method === 'POST') {
    try {
      const { service_name, description } = req.body;
      if (!service_name) {
        return sendResponse(res, false, {}, 'Service name is required', 400, 400);
      }
      const newService = await ServiceModel.createService(service_name, description);
      sendResponse(res, true, newService, '', 0, 201);
    } catch (error) {
      console.error('Error creating services:', error);
      return sendResponse(res, false, {}, 'Failed to creating services', 500);
    }
  } else {
    sendResponse(res, false, {}, 'Method not allowed', 405, 405);
  }
}