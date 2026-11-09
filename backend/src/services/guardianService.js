import bcrypt from 'bcryptjs';
import { Guardian, User, Student } from '../models/index.js';
import { logAudit } from './auditService.js';

export const guardianService = {
  async getAllGuardians(query = {}) {
    const filter = {};
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    return Guardian.find(filter)
      .populate({
        path: 'linkedStudentIds',
        select: 'admissionNumber firstName lastName classId sectionId status',
        populate: [
          { path: 'classId', select: 'name' },
          { path: 'sectionId', select: 'name' },
        ],
      })
      .sort({ fullName: 1 });
  },

  async getGuardianById(id) {
    const guardian = await Guardian.findById(id).populate({
      path: 'linkedStudentIds',
      populate: [
        { path: 'classId', select: 'name academicYear' },
        { path: 'sectionId', select: 'name' },
      ],
    });

    if (!guardian) {
      const err = new Error('Guardian not found');
      err.statusCode = 404;
      throw err;
    }
    return guardian;
  },

  async createGuardian(data, req) {
    let createdUser = null;
    if (data.createAccount) {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        const err = new Error('A user account with this email already exists');
        err.statusCode = 409;
        throw err;
      }

      const passwordHash = await bcrypt.hash(data.password || 'Guardian@123', 10);
      createdUser = await User.create({
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'guardian',
        status: 'active',
      });
      data.userId = createdUser._id;
    }

    const guardian = await Guardian.create(data);

    // If students are linked, update their guardianId reference as well
    if (data.linkedStudentIds && data.linkedStudentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: data.linkedStudentIds } },
        { guardianId: guardian._id }
      );
    }

    await logAudit({
      req,
      action: 'CREATE_GUARDIAN',
      entityType: 'Guardian',
      entityId: guardian._id,
      changeSummary: { ...data, password: '[REDACTED]' },
    });

    return guardian;
  },

  async updateGuardian(id, data, req) {
    const guardian = await Guardian.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!guardian) {
      const err = new Error('Guardian not found');
      err.statusCode = 404;
      throw err;
    }

    if (data.linkedStudentIds) {
      await Student.updateMany(
        { _id: { $in: data.linkedStudentIds } },
        { guardianId: guardian._id }
      );
    }

    await logAudit({
      req,
      action: 'UPDATE_GUARDIAN',
      entityType: 'Guardian',
      entityId: guardian._id,
      changeSummary: data,
    });

    return guardian;
  },

  async getMyChildren(userId) {
    const guardian = await Guardian.findOne({ userId });
    if (!guardian) {
      const err = new Error('Guardian profile not found for this user');
      err.statusCode = 404;
      throw err;
    }

    const students = await Student.find({
      _id: { $in: guardian.linkedStudentIds },
    })
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('guardianId', 'fullName phone email relationship');

    return students;
  },
};
