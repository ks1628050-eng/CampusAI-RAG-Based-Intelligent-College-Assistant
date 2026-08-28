import express from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/overview', authenticateToken, requireAdmin, analyticsController.getOverview);
router.get('/unresolved', authenticateToken, requireAdmin, analyticsController.getUnresolvedQueries);
router.post('/unresolved/:id/resolve', authenticateToken, requireAdmin, analyticsController.resolveQuery);
router.get('/settings', authenticateToken, requireAdmin, analyticsController.getSettings);
router.put('/settings', authenticateToken, requireAdmin, analyticsController.updateSettings);
router.get('/export', authenticateToken, requireAdmin, analyticsController.exportAuditReport);

export default router;
