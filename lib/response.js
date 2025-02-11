export const sendResponse = (res, isSuccess, data = {}, errorMessage = '', errorCode = 0, statusCode = 200) => {
    res.status(statusCode).json({
      isSuccess,
      data,
      errorMessage,
      errorCode,
    });
  };