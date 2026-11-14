import bcrypt from 'bcryptjs';
import { User, Teacher, Guardian, Student, TeacherAssignment, Class, Section, Subject } from '../models/index.js';
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
        isDemo: !!user.isDemo,
        profile,
      },
    };
  },

  async demoLogin({ role = 'admin', req }) {
    const validRoles = ['admin', 'teacher', 'guardian'];
    const selectedRole = validRoles.includes(role) ? role : 'admin';

    const demoEmails = {
      admin: 'demo.admin@algions.edu',
      teacher: 'demo.teacher@algions.edu',
      guardian: 'demo.guardian@algions.edu',
    };

    const targetEmail = demoEmails[selectedRole];
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      const passwordHash = await bcrypt.hash('DemoRestricted@2026', 10);
      user = await User.create({
        email: targetEmail,
        passwordHash,
        role: selectedRole,
        status: 'active',
        isDemo: true,
      });
    } else if (!user.isDemo) {
      user.isDemo = true;
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    let profile = null;

    if (selectedRole === 'teacher') {
      profile = await Teacher.findOne({ userId: user._id });
      if (!profile) {
        // Create teacher profile
        profile = await Teacher.create({
          userId: user._id,
          fullName: 'Prof. David Vance (Guest Faculty)',
          employeeId: 'DEMO-FAC-01',
          department: 'Mathematics & Computing',
          designation: 'Senior Instructor',
          email: targetEmail,
          phone: '+1 555-019-8234',
          status: 'active',
        });

        // Ensure teacher has assignments from available classes/sections/subjects
        const existingAssignment = await TeacherAssignment.findOne({ status: 'active' });
        if (existingAssignment) {
          await TeacherAssignment.create({
            teacherId: profile._id,
            classId: existingAssignment.classId,
            sectionId: existingAssignment.sectionId,
            subjectId: existingAssignment.subjectId,
            academicYear: existingAssignment.academicYear || '2025-2026',
            status: 'active',
          });
        } else {
          const sampleClass = await Class.findOne();
          const sampleSection = await Section.findOne();
          const sampleSubject = await Subject.findOne();
          if (sampleClass && sampleSection && sampleSubject) {
            await TeacherAssignment.create({
              teacherId: profile._id,
              classId: sampleClass._id,
              sectionId: sampleSection._id,
              subjectId: sampleSubject._id,
              academicYear: sampleClass.academicYear || '2025-2026',
              status: 'active',
            });
          }
        }
      }
    } else if (selectedRole === 'guardian') {
      profile = await Guardian.findOne({ userId: user._id });
      if (!profile) {
        // Link to 1 or 2 existing students for demonstration
        const sampleStudents = await Student.find({ status: 'active' }).limit(2).select('_id');
        profile = await Guardian.create({
          userId: user._id,
          fullName: 'Morgan Sterling (Guest Guardian)',
          email: targetEmail,
          phone: '+1 555-018-4421',
          relationship: 'Parent',
          linkedStudentIds: sampleStudents.map((s) => s._id),
        });
      }

      profile = await Guardian.findOne({ userId: user._id }).populate({
        path: 'linkedStudentIds',
        populate: [
          { path: 'classId', select: 'name academicYear' },
          { path: 'sectionId', select: 'name' },
        ],
      });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      isDemo: true,
    });

    await logAudit({
      req,
      action: 'DEMO_LOGIN',
      entityType: 'User',
      entityId: user._id,
      changeSummary: { email: user.email, role: user.role, isDemo: true },
    });

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        isDemo: true,
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
      isDemo: !!user.isDemo,
      profile,
    };
  },
};
