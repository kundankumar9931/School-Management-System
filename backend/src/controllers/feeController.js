import { feeService } from '../services/feeService.js';
import { sendSuccess } from '../utils/response.js';

export const feeController = {
  // Fee Structures
  async getAllStructures(req, res, next) {
    try {
      const structures = await feeService.getAllFeeStructures(req.query);
      return sendSuccess(res, 'Fee structures retrieved successfully', structures);
    } catch (error) {
      next(error);
    }
  },

  async createStructure(req, res, next) {
    try {
      const structure = await feeService.createFeeStructure(req.body, req);
      return sendSuccess(res, 'Fee structure created successfully', structure, 201);
    } catch (error) {
      next(error);
    }
  },

  // Invoices
  async generateInvoice(req, res, next) {
    try {
      const invoice = await feeService.generateInvoice(req.body, req);
      return sendSuccess(res, 'Fee invoice generated successfully', invoice, 201);
    } catch (error) {
      next(error);
    }
  },

  async generateBulkInvoices(req, res, next) {
    try {
      const result = await feeService.generateBulkInvoicesForClass({
        feeStructureId: req.body.feeStructureId,
        req,
      });
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAllInvoices(req, res, next) {
    try {
      const invoices = await feeService.getAllInvoices(req.query, {
        user: req.user,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Invoices retrieved successfully', invoices);
    } catch (error) {
      next(error);
    }
  },

  async getInvoiceById(req, res, next) {
    try {
      const invoice = await feeService.getInvoiceById(req.params.id, {
        user: req.user,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Invoice details retrieved successfully', invoice);
    } catch (error) {
      next(error);
    }
  },

  // Payments
  async recordPayment(req, res, next) {
    try {
      const result = await feeService.recordPayment({
        ...req.body,
        user: req.user,
        req,
      });
      return sendSuccess(res, 'Payment recorded and ledger reconciled successfully', result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAllPayments(req, res, next) {
    try {
      const payments = await feeService.getAllPayments(req.query, {
        user: req.user,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Payments retrieved successfully', payments);
    } catch (error) {
      next(error);
    }
  },

  async getFeeSummary(req, res, next) {
    try {
      const summary = await feeService.getFeeSummary();
      return sendSuccess(res, 'Fee summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  },
};
