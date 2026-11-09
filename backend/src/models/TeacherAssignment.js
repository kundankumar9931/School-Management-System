import mongoose from 'mongoose';

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher reference is required'],
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
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2025-2026',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

teacherAssignmentSchema.index(
  { teacherId: 1, classId: 1, sectionId: 1, subjectId: 1, academicYear: 1 },
  { unique: true }
);

teacherAssignmentSchema.index({ classId: 1, sectionId: 1 });
teacherAssignmentSchema.index({ teacherId: 1 });

export const TeacherAssignment = mongoose.model('TeacherAssignment', teacherAssignmentSchema);
