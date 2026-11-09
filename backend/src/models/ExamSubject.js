import mongoose from 'mongoose';

const examSubjectSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: [true, 'Examination reference is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    examDate: {
      type: Date,
      required: [true, 'Exam date is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      default: 100,
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks is required'],
      default: 40,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

examSubjectSchema.index({ examId: 1, subjectId: 1 }, { unique: true });

export const ExamSubject = mongoose.model('ExamSubject', examSubjectSchema);
