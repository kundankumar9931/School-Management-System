import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee structure name is required'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2025-2026',
    },
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: 0,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    feeType: {
      type: String,
      enum: ['Tuition', 'Admission', 'Examination', 'Laboratory', 'Library', 'Sports', 'Other'],
      default: 'Tuition',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

feeStructureSchema.index({ classId: 1, academicYear: 1 });

export const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
