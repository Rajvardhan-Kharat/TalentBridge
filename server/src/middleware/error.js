const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format`;
  }
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `${field} already exists`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired, please login again';
  }
  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;

