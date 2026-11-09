import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true,
      uppercase: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class reference is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      default: 40,
      min: 1,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sectionSchema.index({ classId: 1, name: 1 }, { unique: true });

export const Section = mongoose.model('Section', sectionSchema);
