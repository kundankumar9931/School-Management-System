import mongoose from 'mongoose';

const gradingRuleSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: [true, 'Grade label is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    minPercentage: {
      type: Number,
      required: [true, 'Minimum percentage is required'],
      min: 0,
      max: 100,
    },
    maxPercentage: {
      type: Number,
      required: [true, 'Maximum percentage is required'],
      min: 0,
      max: 100,
    },
    gradePoint: {
      type: Number,
      required: [true, 'Grade point is required'],
      min: 0,
    },
    isPassing: {
      type: Boolean,
      default: true,
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

gradingRuleSchema.index({ minPercentage: 1, maxPercentage: 1 });

export const GradingRule = mongoose.model('GradingRule', gradingRuleSchema);
