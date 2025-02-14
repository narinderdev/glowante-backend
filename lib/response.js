export const sendResponse = (res, isSuccess, data = {}, errorMessage = '', errorCode = 0, statusCode = 200) => {
  // ✅ Set CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (update for production)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle Preflight Requests
  if (res.req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ Send Response
  return res.status(statusCode).json({
    isSuccess,
    data,
    errorMessage,
    errorCode,
  });
};