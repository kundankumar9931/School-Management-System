import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
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
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
      validate: {
        validator: function (val) {
          const max = this.maxMarks !== undefined 
            ? this.maxMarks 
            : (typeof this.getUpdate === 'function' ? (this.getUpdate()?.$set?.maxMarks ?? 100) : 100);
          return val <= max;
        },
        message: 'Marks obtained cannot exceed maximum marks',
      },
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      default: 100,
      min: 1,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      trim: true,
      default: 'F',
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    evaluatedByTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resultSchema.pre('save', function (next) {
  if (this.maxMarks && this.maxMarks > 0) {
    this.percentage = Number(((this.marksObtained / this.maxMarks) * 100).toFixed(2));
  }
  next();
});

resultSchema.index({ studentId: 1, examId: 1, subjectId: 1 }, { unique: true });
resultSchema.index({ examId: 1, studentId: 1 });

export const Result = mongoose.model('Result', resultSchema);
