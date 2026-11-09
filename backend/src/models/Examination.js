import mongoose from 'mongoose';

const examinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    examType: {
      type: String,
      enum: ['Midterm', 'Final', 'Quarterly', 'Unit Test', 'Practical'],
      required: [true, 'Exam type is required'],
      default: 'Midterm',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2025-2026',
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Published'],
      default: 'Scheduled',
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

examinationSchema.index({ classId: 1, academicYear: 1 });

export const Examination = mongoose.model('Examination', examinationSchema);
