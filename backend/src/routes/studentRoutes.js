import { Router } from 'express';
import { studentController } from '../controllers/studentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { studentCreateSchema, studentUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', studentController.getAll);
router.get('/:id', studentController.getById);
router.post('/', authorize(['admin']), validateRequest(studentCreateSchema), studentController.create);
router.put('/:id', authorize(['admin']), validateRequest(studentUpdateSchema), studentController.update);
router.delete('/:id', authorize(['admin']), studentController.delete);

// Student History Endpoints
router.get('/:id/academics', studentController.getAcademicHistory);
router.get('/:id/attendance', studentController.getAttendanceHistory);
router.get('/:id/fees', studentController.getFeeHistory);

export default router;
