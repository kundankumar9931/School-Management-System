import { Router } from 'express';
import { feeController } from '../controllers/feeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  feeStructureCreateSchema,
  feeInvoiceCreateSchema,
  paymentCreateSchema,
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Fee Structures
router.get('/structures', feeController.getAllStructures);
router.post('/structures', authorize(['admin']), validateRequest(feeStructureCreateSchema), feeController.createStructure);

// Fee Invoices
router.post('/invoices', authorize(['admin']), validateRequest(feeInvoiceCreateSchema), feeController.generateInvoice);
router.post('/invoices/bulk', authorize(['admin']), feeController.generateBulkInvoices);
router.get('/invoices', feeController.getAllInvoices);
router.get('/invoices/:id', feeController.getInvoiceById);

// Payments (simulated ledger)
router.post('/payments', authorize(['admin']), validateRequest(paymentCreateSchema), feeController.recordPayment);
router.get('/payments', feeController.getAllPayments);
router.get('/summary', authorize(['admin']), feeController.getFeeSummary);

export default router;
