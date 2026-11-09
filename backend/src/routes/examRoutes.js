import { Router } from 'express';
import { examController } from '../controllers/examController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  examCreateSchema,
  marksSubmitSchema,
  gradingRuleCreateSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Examinations
router.get('/examinations', examController.getAllExams);
router.get('/examinations/:id', examController.getExamById);
router.post('/examinations', authorize(['admin']), validateRequest(examCreateSchema), examController.createExam);
router.put('/examinations/:id', authorize(['admin']), examController.updateExam);
router.delete('/examinations/:id', authorize(['admin']), examController.deleteExam);

// Results & Marks
router.post('/results', authorize(['admin', 'teacher']), validateRequest(marksSubmitSchema), examController.submitMarks);
router.get('/results', examController.getResults);
router.get('/results/report-card/:studentId/:examId', examController.getReportCard);

// Grading Rules
router.get('/grading-rules', examController.getGradingRules);
router.post('/grading-rules', authorize(['admin']), validateRequest(gradingRuleCreateSchema), examController.createGradingRule);

export default router;
