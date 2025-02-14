import Cors from 'cors';

// Initialize the CORS middleware
const cors = Cors({
  origin: '*', // Allow all origins (change this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Helper function to run the middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function corsMiddleware(req, res, next) {
  await runMiddleware(req, res, cors);
  next();
}