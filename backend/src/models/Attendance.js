import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section reference is required'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    session: {
      type: String,
      enum: ['Morning', 'Afternoon'],
      required: [true, 'Session is required'],
      default: 'Morning',
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: [true, 'Attendance status is required'],
      default: 'Present',
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

// Compound unique index ensuring no duplicate attendance for student + date + session
attendanceSchema.index({ studentId: 1, date: 1, session: 1 }, { unique: true });
attendanceSchema.index({ classId: 1, sectionId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
