export const sendResponse = (res, isSuccess, data = {}, errorMessage = '', errorCode = 0, statusCode = 200) => {
  console.log("🔹 Incoming Request Details:");
  console.log("  ➜ Method:", res.req.method);
  console.log("  ➜ URL:", res.req.url);
  console.log("  ➜ Headers:", res.req.headers);
  console.log("  ➜ Origin:", res.req.headers.origin || "Unknown Origin");

  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins (change this in production)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  console.log("✅ CORS Headers Applied:");
  console.log("  ➜ Access-Control-Allow-Origin:", res.getHeader("Access-Control-Allow-Origin"));
  console.log("  ➜ Access-Control-Allow-Methods:", res.getHeader("Access-Control-Allow-Methods"));
  console.log("  ➜ Access-Control-Allow-Headers:", res.getHeader("Access-Control-Allow-Headers"));

  // ✅ Handle Preflight Requests (OPTIONS)
  if (res.req.method === "OPTIONS") {
    console.log("🟡 OPTIONS request detected, sending 204 No Content.");
    return res.status(204).end();
  }

  // ✅ Log Response Data
  console.log("🔹 Response Data:");
  console.log({
    isSuccess,
    data,
    errorMessage,
    errorCode,
    statusCode,
  });

  // ✅ Send Final Response
  return res.status(statusCode).json({
    isSuccess,
    data,
    errorMessage,
    errorCode,
  });
};