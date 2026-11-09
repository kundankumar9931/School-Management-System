import { Router } from 'express';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import guardianRoutes from './guardianRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import classRoutes from './classRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import examRoutes from './examRoutes.js';
import feeRoutes from './feeRoutes.js';
import { reportRouter, auditRouter } from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/guardians', guardianRoutes);
router.use('/teachers', teacherRoutes);
router.use('/', classRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/', examRoutes);
router.use('/fees', feeRoutes);
router.use('/reports', reportRouter);
router.use('/audit-logs', auditRouter);

export default router;
