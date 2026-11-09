import { FeeStructure, FeeInvoice, Payment, Student } from '../models/index.js';
import { logAudit } from './auditService.js';

export const feeService = {
  // Fee Structures
  async getAllFeeStructures(query = {}) {
    const filter = {};
    if (query.classId) filter.classId = query.classId;
    if (query.academicYear) filter.academicYear = query.academicYear;
    return FeeStructure.find(filter).populate('classId', 'name academicYear').sort({ dueDate: 1 });
  },

  async createFeeStructure(data, req) {
    const structure = await FeeStructure.create(data);
    await logAudit({
      req,
      action: 'CREATE_FEE_STRUCTURE',
      entityType: 'FeeStructure',
      entityId: structure._id,
      changeSummary: data,
    });
    return structure.populate('classId', 'name academicYear');
  },

  // Fee Invoices
  async generateInvoice(data, req) {
    const student = await Student.findById(data.studentId);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    const structure = await FeeStructure.findById(data.feeStructureId);
    if (!structure) {
      const err = new Error('Fee structure not found');
      err.statusCode = 404;
      throw err;
    }

    const count = await FeeInvoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const totalAmount = data.totalAmount !== undefined ? data.totalAmount : structure.amount;
    const dueDate = data.dueDate || structure.dueDate;

    const invoice = await FeeInvoice.create({
      invoiceNumber,
      studentId: student._id,
      feeStructureId: structure._id,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      dueDate,
      status: new Date(dueDate) < new Date() ? 'Overdue' : 'Unpaid',
      remarks: data.remarks || '',
    });

    await logAudit({
      req,
      action: 'GENERATE_INVOICE',
      entityType: 'FeeInvoice',
      entityId: invoice._id,
      changeSummary: { invoiceNumber, studentId: student._id, totalAmount },
    });

    return invoice.populate([
      { path: 'studentId', select: 'admissionNumber firstName lastName classId sectionId' },
      { path: 'feeStructureId', select: 'name feeType amount' },
    ]);
  },

  async generateBulkInvoicesForClass({ feeStructureId, req }) {
    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) {
      const err = new Error('Fee structure not found');
      err.statusCode = 404;
      throw err;
    }

    const students = await Student.find({ classId: structure.classId, status: 'active' });
    const currentCount = await FeeInvoice.countDocuments();
    let counter = currentCount + 1;

    const createdInvoices = [];
    for (const student of students) {
      // Check if invoice for this student and structure already exists
      const existing = await FeeInvoice.findOne({
        studentId: student._id,
        feeStructureId: structure._id,
      });

      if (!existing) {
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(counter++).padStart(5, '0')}`;
        const invoice = await FeeInvoice.create({
          invoiceNumber,
          studentId: student._id,
          feeStructureId: structure._id,
          totalAmount: structure.amount,
          paidAmount: 0,
          outstandingAmount: structure.amount,
          dueDate: structure.dueDate,
          status: new Date(structure.dueDate) < new Date() ? 'Overdue' : 'Unpaid',
        });
        createdInvoices.push(invoice);
      }
    }

    await logAudit({
      req,
      action: 'GENERATE_BULK_INVOICES',
      entityType: 'FeeInvoice',
      entityId: structure._id,
      changeSummary: { feeStructureId, generatedCount: createdInvoices.length },
    });

    return {
      message: `Generated ${createdInvoices.length} invoices successfully`,
      count: createdInvoices.length,
    };
  },

  async getAllInvoices(query = {}, { user, guardian }) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.studentId) filter.studentId = query.studentId;

    if (user.role === 'guardian') {
      if (!guardian) return [];
      filter.studentId = { $in: guardian.linkedStudentIds };
      if (query.studentId) {
        if (!guardian.linkedStudentIds.some((id) => id.toString() === query.studentId.toString())) {
          const err = new Error('Access denied. Cannot view invoices for unlinked student.');
          err.statusCode = 403;
          throw err;
        }
        filter.studentId = query.studentId;
      }
    }

    const invoices = await FeeInvoice.find(filter)
      .populate({
        path: 'studentId',
        select: 'admissionNumber firstName lastName classId sectionId',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .populate('feeStructureId', 'name feeType academicYear amount')
      .sort({ dueDate: -1 });

    return invoices;
  },

  async getInvoiceById(id, { user, guardian }) {
    const invoice = await FeeInvoice.findById(id)
      .populate({
        path: 'studentId',
        select: 'admissionNumber firstName lastName classId sectionId guardianId',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
          { path: 'guardianId', select: 'fullName email phone' },
        ],
      })
      .populate('feeStructureId', 'name feeType academicYear amount description');

    if (!invoice) {
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'guardian') {
      const isLinked = guardian?.linkedStudentIds?.some(
        (childId) => childId.toString() === invoice.studentId._id.toString()
      );
      if (!isLinked) {
        const err = new Error('Access denied. Invoice does not belong to your linked children.');
        err.statusCode = 403;
        throw err;
      }
    }

    const payments = await Payment.find({ invoiceId: id }).sort({ paymentDate: -1 });

    return {
      ...invoice.toObject(),
      payments,
    };
  },

  // Atomic ledger update and payment recording
  async recordPayment({ invoiceId, amount, paymentMethod, transactionReference, notes, user, req }) {
    if (!amount || amount <= 0) {
      const err = new Error('Payment amount must be greater than zero');
      err.statusCode = 400;
      throw err;
    }

    const invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.statusCode = 404;
      throw err;
    }

    // Business validation: Payment cannot exceed outstanding balance
    if (amount > invoice.outstandingAmount) {
      const err = new Error(
        `Payment amount ($${amount}) exceeds outstanding balance ($${invoice.outstandingAmount})`
      );
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate payment reference if specified
    if (transactionReference && transactionReference.trim() !== '') {
      const existingPayment = await Payment.findOne({ transactionReference: transactionReference.trim() });
      if (existingPayment) {
        const err = new Error(`A payment with transaction reference '${transactionReference}' already exists`);
        err.statusCode = 400;
        throw err;
      }
    }

    const count = await Payment.countDocuments();
    const paymentId = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    // Create payment record
    const payment = await Payment.create({
      paymentId,
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      amount,
      paymentMethod,
      transactionReference: transactionReference || `SIM-${Date.now()}`,
      status: 'Success',
      recordedByUserId: user?._id || null,
      receiptNumber,
      notes: notes || '',
    });

    // Reconcile invoice ledger totals accurately
    invoice.paidAmount += amount;
    invoice.outstandingAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    await logAudit({
      req,
      action: 'RECORD_PAYMENT',
      entityType: 'Payment',
      entityId: payment._id,
      changeSummary: {
        paymentId,
        invoiceId: invoice._id,
        amount,
        newPaidAmount: invoice.paidAmount,
        newOutstandingAmount: invoice.outstandingAmount,
        status: invoice.status,
      },
    });

    return {
      payment,
      invoiceSummary: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstandingAmount: invoice.outstandingAmount,
        status: invoice.status,
      },
    };
  },

  async getAllPayments(query = {}, { user, guardian }) {
    const filter = {};
    if (query.invoiceId) filter.invoiceId = query.invoiceId;
    if (query.studentId) filter.studentId = query.studentId;

    if (user.role === 'guardian') {
      if (!guardian) return [];
      filter.studentId = { $in: guardian.linkedStudentIds };
    }

    return Payment.find(filter)
      .populate({
        path: 'studentId',
        select: 'admissionNumber firstName lastName classId sectionId',
      })
      .populate('invoiceId', 'invoiceNumber totalAmount outstandingAmount status')
      .populate('recordedByUserId', 'email role')
      .sort({ paymentDate: -1 });
  },

  async getFeeSummary() {
    const invoices = await FeeInvoice.find();
    let totalGenerated = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let paidInvoicesCount = 0;
    let partiallyPaidCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      totalGenerated += inv.totalAmount;
      totalCollected += inv.paidAmount;
      totalOutstanding += inv.outstandingAmount;

      if (inv.status === 'Paid') paidInvoicesCount++;
      else if (inv.status === 'Partially Paid') partiallyPaidCount++;
      else if (inv.status === 'Overdue') overdueCount++;
      else unpaidCount++;
    });

    return {
      totalGenerated,
      totalCollected,
      totalOutstanding,
      invoiceCounts: {
        total: invoices.length,
        paid: paidInvoicesCount,
        partiallyPaid: partiallyPaidCount,
        unpaid: unpaidCount,
        overdue: overdueCount,
      },
    };
  },
};
