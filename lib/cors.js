import Cors from 'cors';

// ✅ Initialize the CORS middleware
const cors = Cors({
  origin: '*', // Allow all origins (change this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// ✅ Helper function to run the middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        console.error("❌ CORS Middleware Error:", result); // Log errors
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// ✅ CORS Middleware with Debugging Logs
export default async function corsMiddleware(req, res, next) {
  console.log("🔹 Incoming Request:", req.method, req.url);
  console.log("🔹 Origin:", req.headers.origin || "Unknown Origin");

  try {
    await runMiddleware(req, res, cors);
    console.log("✅ CORS Middleware Passed Successfully");

    // Log Headers Set by CORS
    console.log("🔹 CORS Headers Set:");
    console.log("  ➜ Access-Control-Allow-Origin:", res.getHeader("Access-Control-Allow-Origin"));
    console.log("  ➜ Access-Control-Allow-Methods:", res.getHeader("Access-Control-Allow-Methods"));
    console.log("  ➜ Access-Control-Allow-Headers:", res.getHeader("Access-Control-Allow-Headers"));

    next();
  } catch (error) {
    console.error("❌ CORS Middleware Failed:", error);
    res.status(500).json({ message: "CORS Middleware Error", error });
  }
}