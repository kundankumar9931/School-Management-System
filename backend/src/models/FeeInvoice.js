import mongoose from 'mongoose';

const feeInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: [true, 'Fee structure reference is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue'],
      default: 'Unpaid',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feeInvoiceSchema.pre('validate', function (next) {
  if (this.totalAmount !== undefined && this.paidAmount !== undefined) {
    this.outstandingAmount = Math.max(0, this.totalAmount - this.paidAmount);
    if (this.paidAmount >= this.totalAmount && this.totalAmount > 0) {
      this.status = 'Paid';
    } else if (this.paidAmount > 0) {
      this.status = 'Partially Paid';
    } else {
      if (this.dueDate && new Date(this.dueDate) < new Date()) {
        this.status = 'Overdue';
      } else {
        this.status = 'Unpaid';
      }
    }
  }
  next();
});

feeInvoiceSchema.index({ studentId: 1, status: 1 });
feeInvoiceSchema.index({ dueDate: 1 });

export const FeeInvoice = mongoose.model('FeeInvoice', feeInvoiceSchema);
