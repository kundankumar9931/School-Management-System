import { Router } from 'express';
import { classController } from '../controllers/classController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  classCreateSchema,
  sectionCreateSchema,
  subjectCreateSchema,
  assignmentCreateSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Classes
router.get('/classes', classController.getAllClasses);
router.get('/classes/:id', classController.getClassById);
router.post('/classes', authorize(['admin']), validateRequest(classCreateSchema), classController.createClass);
router.put('/classes/:id', authorize(['admin']), classController.updateClass);
router.delete('/classes/:id', authorize(['admin']), classController.deleteClass);

// Sections
router.get('/sections', classController.getAllSections);
router.post('/sections', authorize(['admin']), validateRequest(sectionCreateSchema), classController.createSection);
router.put('/sections/:id', authorize(['admin']), classController.updateSection);
router.delete('/sections/:id', authorize(['admin']), classController.deleteSection);

// Subjects
router.get('/subjects', classController.getAllSubjects);
router.get('/subjects/:id', classController.getSubjectById);
router.post('/subjects', authorize(['admin']), validateRequest(subjectCreateSchema), classController.createSubject);
router.put('/subjects/:id', authorize(['admin']), classController.updateSubject);
router.delete('/subjects/:id', authorize(['admin']), classController.deleteSubject);

// Teacher Assignments
router.get('/assignments', authorize(['admin', 'teacher']), classController.getAllAssignments);
router.post('/assignments', authorize(['admin']), validateRequest(assignmentCreateSchema), classController.createAssignment);
router.delete('/assignments/:id', authorize(['admin']), classController.deleteAssignment);

export default router;
