import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { loginSchema } from '../validators/schemas.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/demo', authController.demo);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
