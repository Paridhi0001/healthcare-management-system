const errorHandler = (err, req, res, next) => {
  console.error('SERVER EXCEPTION TRIGGERED:', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose cast exceptions
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found: Invalid database ID';
  }

  // Handle unique constraint violations (e.g. duplicate email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Data conflict: Entry already exists in registry';
  }

  // Handle validation exceptions
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { errorHandler };
