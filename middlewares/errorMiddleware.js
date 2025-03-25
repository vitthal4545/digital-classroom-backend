const errorHandler = (err, req, res, next) => {
  console.error("Error: ", err);

  // Handle different error types if needed (e.g., ValidationError, CastError, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    });
  }

  // Handle other specific errors
  if (err.code === 11000) {
    // Duplicate key error (e.g., unique email)
    return res.status(400).json({
      message: "Duplicate key error",
      error: err.keyValue,
    });
  }

  // Default 500 internal server error
  return res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
};

module.exports = errorHandler;
