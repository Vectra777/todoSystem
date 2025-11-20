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

async function isAdmin(tokenOrHeader) {
  try {
    if (!tokenOrHeader) return false;
    const token = String(tokenOrHeader).startsWith('Bearer ') ? String(tokenOrHeader).split(' ')[1] : tokenOrHeader;
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) return false;
    // Lazy-require DB to avoid circular requires at module init
    const db = require('../models');
    const Employee = db.employees;
    const user = await Employee.findByPk(decoded.id);
    if (!user) return false;
    const role = (user.role || '').toString().toLowerCase();
    return role === 'admin';
  } catch (err) {
    return false;
  }
}

async function isHr(tokenOrHeader) {
  try {
    if (!tokenOrHeader) return false;
    const token = String(tokenOrHeader).startsWith('Bearer ') ? String(tokenOrHeader).split(' ')[1] : tokenOrHeader;
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) return false;
    const db = require('../models');
    const Employee = db.employees;
    const user = await Employee.findByPk(decoded.id);
    if (!user) return false;
    const role = (user.role || '').toString().toLowerCase();
    return role === 'hr' || role === 'admin';
  } catch (err) {
    return false;
  }
}

/**
 * Middleware to protect GET endpoints: only HR or Admin can access.
 * Expects Authorization: Bearer <token> header.
 */
async function ensureGetAllowed(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header is missing' });
    const admin = await isAdmin(authHeader);
    const hr = await isHr(authHeader);
    if (admin || hr) return next();
    return res.status(403).json({ message: 'Forbidden: HR or Admin role required' });
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
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
  refreshTokens,
  isAdmin,
  isHr,
  ensureGetAllowed
};


async function ensureSelfOrHrOrAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header is missing' });
    // Check roles first
    const admin = await isAdmin(authHeader);
    const hr = await isHr(authHeader);
    if (admin || hr) return next();

    // Otherwise decode token to check owner
    const token = String(authHeader).startsWith('Bearer ') ? String(authHeader).split(' ')[1] : authHeader;
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) return res.status(403).json({ message: 'Forbidden' });
    const paramId = req.params.employeeId || req.params.employee_id || req.query.employeeId;
    if (String(decoded.id) === String(paramId)) return next();
    return res.status(403).json({ message: 'Forbidden: not allowed' });
  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
}

module.exports.ensureSelfOrHrOrAdmin = ensureSelfOrHrOrAdmin;

/**
 * Middleware: ensure requester is an Admin (authorization required).
 */
function ensureAdmin(req, res, next) {
  const decoded = ensureAuthenticated(req, res);
  if (!decoded) return; // ensureAuthenticated already sent response
  const role = (decoded.role || '').toString().toLowerCase();
  if (role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  return next();
}

module.exports.ensureAdmin = ensureAdmin;
