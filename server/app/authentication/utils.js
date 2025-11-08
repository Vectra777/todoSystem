const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// In-memory store for refresh tokens (replace with a persistent store in production)
const refreshTokens = new Set();

function generateAccessToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    ...options
  });
}

function generateRefreshToken(payload, options = {}) {
  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    ...options
  });
  refreshTokens.add(token);
  return token;
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  if (!refreshTokens.has(token)) {
    const error = new Error('Refresh token revoked');
    error.name = 'TokenRevokedError';
    throw error;
  }
  return decoded;
}

function revokeRefreshToken(token) {
  refreshTokens.delete(token);
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

async function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authorization header format must be Bearer <token>' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function ensureAuthenticated(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header is missing' });
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Authorization header format must be Bearer <token>' });
    return null;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  authenticateJWT,
  ensureAuthenticated,
  hashPassword,
  comparePassword,
  refreshTokens
};
