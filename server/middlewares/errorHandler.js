function errorHandler(err, req, res, next) {
  const name = err.name || 'Error';
  let code = 500;
  let message = err.message || 'Internal Server Error';
  let error = name;

  switch (name) {
    case 'SequelizeValidationError':
    case 'ValidationError':
      code = 400;
      error = 'ValidationError';
      message = err.message;
      break;
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      code = 401;
      error = 'AuthenticationError';
      message = err.message;
      break;
    case 'NotFoundError':
      code = 404;
      error = 'NotFound';
      message = err.message;
      break;
    case 'UnauthorizedError':
      code = 401;
      error = 'Unauthorized';
      message = err.message;
      break;
    default:
      code = err.status || 500;
      error = name;
      message = err.message || 'Internal Server Error';
  }

  return res.status(code).json({ error, message });
}

module.exports = errorHandler;
