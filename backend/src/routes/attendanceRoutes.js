import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { attendanceSubmitSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(['admin', 'teacher']),
  validateRequest(attendanceSubmitSchema),
  attendanceController.recordAttendance
);

router.get(
  '/daily',
  authorize(['admin', 'teacher']),
  attendanceController.getDailyAttendance
);

router.get(
  '/student/:studentId',
  attendanceController.getStudentSummary
);

export default router;
