export function globalErrorHandler(err, req, res, next) {
  console.error("Global Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // MongoDB CastError 
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB Duplicate Key Error 
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field} field`;
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  return res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
}