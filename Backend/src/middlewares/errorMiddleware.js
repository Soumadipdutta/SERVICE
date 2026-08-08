// 404 handler — mount after all routes
function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler — mount last, after notFound
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma known error codes
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: `A record with this ${err.meta?.target || "value"} already exists`,
    });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  // zod validation errors
  if (err.name === "ZodError") {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.issues || err.errors,
    });
  }

  // multer errors (file too large, wrong type, etc.)
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  const status = err.status || 500;
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
}

export { notFound, errorHandler };