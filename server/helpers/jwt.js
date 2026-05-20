const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'halogais';

function signToken(payload) {
  return jwt.sign(payload, SECRET);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
