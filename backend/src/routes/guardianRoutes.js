import { Router } from 'express';
import { guardianController } from '../controllers/guardianController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { guardianCreateSchema, guardianUpdateSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Guardian self profile children list
router.get('/my-children', authorize(['guardian']), guardianController.getMyChildren);

// Admin operations
router.get('/', authorize(['admin']), guardianController.getAll);
router.get('/:id', authorize(['admin']), guardianController.getById);
router.post('/', authorize(['admin']), validateRequest(guardianCreateSchema), guardianController.create);
router.put('/:id', authorize(['admin']), validateRequest(guardianUpdateSchema), guardianController.update);

export default router;
