import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'campus_ai_super_secret_jwt_key_2026';

/**
 * Middleware to verify JWT token and attach user to req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied: No authentication token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findOne('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or user not found' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

/**
 * Optional authentication middleware (allows anonymous guests but identifies logged-in users)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.findOne('users', u => u.id === decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    } catch (err) {
      // Ignore invalid token in optional auth
    }
  }
  next();
}

/**
 * Middleware to enforce Admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access privileges required' });
  }
  next();
}

/**
 * Generates JWT token for user
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
