import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.post('/demo', authController.demoLogin);
router.get('/me', authenticateToken, authController.getMe);

export default router;
