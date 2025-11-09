import { Router } from 'express';
import { getAdminStats, getMonitorStats, getStudentStats } from '../controllers/stats.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(protect);

router.get('/admin', restrictTo(UserRole.Admin), getAdminStats);
router.get('/monitor', restrictTo(UserRole.Admin, UserRole.Monitor), getMonitorStats);
router.get('/student', restrictTo(UserRole.Student), getStudentStats);

export default router;