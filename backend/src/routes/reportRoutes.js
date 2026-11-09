import { Router } from 'express';
import { reportController, auditController } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

export const reportRouter = Router();
reportRouter.use(authenticate);
reportRouter.get('/dashboard', authorize(['admin']), reportController.getDashboard);
reportRouter.get('/attendance', authorize(['admin', 'teacher']), reportController.getAttendanceReport);
reportRouter.get('/academic', authorize(['admin', 'teacher']), reportController.getAcademicReport);
reportRouter.get('/fees', authorize(['admin']), reportController.getFeeReport);

export const auditRouter = Router();
auditRouter.use(authenticate);
auditRouter.get('/', authorize(['admin']), auditController.getAllLogs);
