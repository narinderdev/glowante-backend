import { sendResponse } from '../../../lib/response';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendResponse(res, false, {}, 'Method Not Allowed', 405);
  }

  try {
    const { salon_id } = req.body;

    // Validate input
    if (!salon_id) {
      return sendResponse(res, false, {}, 'Salon ID is required', 400);
    }

    // Dummy data for salon details including services, deals, team members, reviews, and about section
    const salons = {
      1: {
        id: 1,
        salon_name: "Broad Way Beauty Bar",
        address: "Sector 75, Mohali, 160059",
        country_code: "+91",
        phone_no: "9876543210",
        email: "contact@broadwaybeauty.com",
        opening_time: "10:00 AM",
        closing_time: "9:00 PM",
        rating: 4.2,
        reviews_count: 212,
        distance: "5 Km",
        salon_picture_url: "https://example.com/salon1.jpg",

        categories: [
          {
            id: 101,
            name: "Hydrating Facial",
            description: "Get healthy glowy skin",
            price: "₹1200",
            duration: "60 mins",
            rating: 4.88,
            reviews_count: 136,
            category: "Facial",
            image_url: "https://example.com/services/hydrating_facial.jpg"
          },
          {
            id: 102,
            name: "Haircut",
            description: "Professional haircut with styling",
            price: "₹500",
            duration: "30 min",
            rating: 4.5,
            reviews_count: 95,
            category: "Hair",
            image_url: "https://example.com/services/haircut.jpg"
          }
        ],

        deals: [
          {
            id: 201,
            name: "Men: Haircut + Hair Wash + Hair Styling",
            original_price: "₹350",
            discounted_price: "₹279",
            discount: "50% OFF",
            validity: "Valid for All Days",
            timing: "10 AM - 8 PM",
            bought_count: 396,
            best_seller: true
          }
        ],

        team_members: [
          {
            id: 301,
            name: "Ms. Avisha",
            role: "Hair Dresser",
            experience: "1yr+ Experience",
            rating: 4.5,
            reviews_count: 43,
            profile_picture_url: "https://example.com/team/avisha.jpg"
          }
        ],

        reviews: {
          overall_rating: 4.0,
          total_reviews: 788,
          breakdown: {
            excellent: 719,
            good: 52,
            average: 8,
            bad: 3,
            very_bad: 6
          },
          user_reviews: [
            {
              name: "Palak",
              comment: "I love the service and enjoy it.",
              rating: 5,
              date: "Oct 22, 2024"
            },
            {
              name: "Emily",
              comment: "I love the service and enjoy it.",
              rating: 5,
              date: "Oct 22, 2024"
            }
          ]
        },

        about: "Welcome to Broad way Beauty Bar, your ultimate destination for beauty, relaxation, and transformation. At our salon, we pride ourselves on creating a welcoming space where you can unwind and let your true beauty shine. From cutting-edge hair styling to luxurious spa treatments, we are committed to providing services that go beyond your expectations."
      }
    };

    // Fetch salon details
    const salon = salons[salon_id];

    if (!salon) {
      return sendResponse(res, false, {}, 'Salon not found', 404);
    }

    return sendResponse(res, true, salon, '', 0);
  } catch (error) {
    console.error('Error fetching salon details:', error);
    return sendResponse(res, false, {}, 'Failed to fetch salon details', 500);
  }
}