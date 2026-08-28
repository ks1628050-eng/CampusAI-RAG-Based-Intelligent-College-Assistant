import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { generateToken } from '../middleware/auth.js';

export const authController = {
  /**
   * User Registration (Student or Admin)
   */
  async register(req, res) {
    try {
      const { name, email, password, role = 'student', department = 'General' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      }

      const existingUser = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: ['admin', 'student'].includes(role) ? role : 'student',
        department,
        createdAt: new Date().toISOString()
      };

      db.insert('users', newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  },

  /**
   * User Login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password credentials' });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error during login' });
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res) {
    try {
      const user = db.findOne('users', u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error fetching user profile' });
    }
  },

  /**
   * Instant One-Click Demo Login for Evaluators (Student or Admin)
   */
  async demoLogin(req, res) {
    try {
      const { role = 'student' } = req.body;
      const targetEmail = role === 'admin' ? 'admin@campus.edu' : 'student@campus.edu';
      
      let user = db.findOne('users', u => u.email === targetEmail);
      if (!user) {
        const passwordHash = await bcrypt.hash('demo123', 10);
        user = {
          id: uuidv4(),
          name: role === 'admin' ? 'Campus Administrator' : 'Alex Student',
          email: targetEmail,
          passwordHash,
          role: role === 'admin' ? 'admin' : 'student',
          department: role === 'admin' ? 'Administration' : 'Computer Science',
          createdAt: new Date().toISOString()
        };
        db.insert('users', user);
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        message: `Logged in as Demo ${role.toUpperCase()}`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error initiating demo login' });
    }
  }
};
