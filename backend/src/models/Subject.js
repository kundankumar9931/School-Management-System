import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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

export const Subject = mongoose.model('Subject', subjectSchema);
