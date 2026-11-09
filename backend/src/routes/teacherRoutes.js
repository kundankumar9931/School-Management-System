import { Router } from 'express';
import { teacherController } from '../controllers/teacherController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { teacherCreateSchema, teacherUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Teacher personal classes
router.get('/my-classes', authorize(['teacher']), teacherController.getMyClasses);

// General/Admin endpoints
router.get('/', authorize(['admin', 'teacher']), teacherController.getAll);
router.get('/:id', authorize(['admin', 'teacher']), teacherController.getById);
router.post('/', authorize(['admin']), validateRequest(teacherCreateSchema), teacherController.create);
router.put('/:id', authorize(['admin']), validateRequest(teacherUpdateSchema), teacherController.update);
router.delete('/:id', authorize(['admin']), teacherController.delete);

export default router;
