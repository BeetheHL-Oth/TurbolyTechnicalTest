const { verifyToken } = require('../helpers/jwt');

async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    const err = new Error('Authentication required');
    err.name = 'UnauthorizedError';
    return next(err);
  }
  const payload = verifyToken(token);
  if (!payload) {
    const err = new Error('Invalid token');
    err.name = 'JsonWebTokenError';
    return next(err);
  }
  req.user = { id: payload.id, email: payload.email };
  next();
}

module.exports = auth;
