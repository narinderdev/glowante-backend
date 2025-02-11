import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { latitude, longitude, zipcode } = req.body;

    // Validate input
    if (!latitude || !longitude || !zipcode) {
      return sendResponse(res, false, {}, 'Latitude, Longitude, and Zipcode are required', 400);
    }

    // Dummy data with different salons
    const salons = [
      {
        id: 1,
        salon_name: "The Royal Salon",
        address: "Phase 5, Mohali, 160059",
        country_code: "+91",
        phone_no: "9812345678",
        opening_time: "9:00 AM",
        closing_time: "8:00 PM",
        rating: 4.6,
        reviews_count: 320,
        distance: "3 Km",
        salon_picture_url: "https://example.com/salons/royal_salon.jpg"
      },
      {
        id: 2,
        salon_name: "Luxury Hair & Beauty",
        address: "Sector 22, Chandigarh, 160022",
        country_code: "+91",
        phone_no: "9988776655",
        opening_time: "10:00 AM",
        closing_time: "9:30 PM",
        rating: 4.8,
        reviews_count: 280,
        distance: "7 Km",
        salon_picture_url: "https://example.com/salons/luxury_hair.jpg"
      },
      {
        id: 3,
        salon_name: "Glamour Spa & Wellness",
        address: "Sector 35, Chandigarh, 160035",
        country_code: "+91",
        phone_no: "9876543210",
        opening_time: "9:30 AM",
        closing_time: "8:30 PM",
        rating: 4.7,
        reviews_count: 260,
        distance: "9 Km",
        salon_picture_url: "https://example.com/salons/glamour_spa.jpg"
      }
    ];

    return sendResponse(res, true, { salons }, '', 0);
  } catch (error) {
    console.error('Error fetching nearby salons list:', error);
    return sendResponse(res, false, {}, 'Failed to fetch nearby salons list', 500);
  }
}