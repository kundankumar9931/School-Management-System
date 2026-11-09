import { User, Teacher, Guardian } from '../models/index.js';
import { generateToken } from '../utils/token.js';
import { logAudit } from './auditService.js';

export const authService = {
  async login({ email, password, req }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Account has been deactivated. Please contact administrator.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    user.lastLogin = new Date();
    await user.save();

    let profile = null;
    if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id });
    } else if (user.role === 'guardian') {
      profile = await Guardian.findOne({ userId: user._id }).populate('linkedStudentIds');
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    await logAudit({
      req,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user._id,
      changeSummary: { email: user.email, role: user.role },
    });

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        profile,
      },
    };
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    let profile = null;
    if (user.role === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id });
    } else if (user.role === 'guardian') {
      profile = await Guardian.findOne({ userId: user._id }).populate({
        path: 'linkedStudentIds',
        populate: [
          { path: 'classId', select: 'name academicYear' },
          { path: 'sectionId', select: 'name' },
        ],
      });
    }

    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      profile,
    };
  },
};
