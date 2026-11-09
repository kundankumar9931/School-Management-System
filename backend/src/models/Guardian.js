import mongoose from 'mongoose';

const guardianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    fullName: {
      type: String,
      required: [true, 'Guardian full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Legal Guardian', 'Relative', 'Other'],
      default: 'Father',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    linkedStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
);

guardianSchema.index({ email: 1 });
guardianSchema.index({ linkedStudentIds: 1 });

export const Guardian = mongoose.model('Guardian', guardianSchema);
