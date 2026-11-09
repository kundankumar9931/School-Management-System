import bcrypt from 'bcryptjs';
import { Teacher, User, TeacherAssignment, Class, Section, Subject } from '../models/index.js';
import { logAudit } from './auditService.js';

export const teacherService = {
  async getAllTeachers(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { employeeId: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const teachers = await Teacher.find(filter).sort({ fullName: 1 });

    // Populate assignments count
    const teacherIds = teachers.map((t) => t._id);
    const assignments = await TeacherAssignment.find({
      teacherId: { $in: teacherIds },
      status: 'active',
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code');

    const result = teachers.map((teacher) => {
      const teacherObj = teacher.toObject();
      teacherObj.assignments = assignments.filter(
        (a) => a.teacherId.toString() === teacher._id.toString()
      );
      return teacherObj;
    });

    return result;
  },

  async getTeacherById(id) {
    const teacher = await Teacher.findById(id).populate('userId', 'email role status lastLogin');
    if (!teacher) {
      const err = new Error('Teacher not found');
      err.statusCode = 404;
      throw err;
    }

    const assignments = await TeacherAssignment.find({ teacherId: id, status: 'active' })
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code maxMarks passingMarks');

    const teacherObj = teacher.toObject();
    teacherObj.assignments = assignments;
    return teacherObj;
  },

  async createTeacher(data, req) {
    let createdUser = null;
    if (data.createAccount) {
      const existingUser = await User.findOne({ email: data.email.toLowerCase() });
      if (existingUser) {
        const err = new Error('A user account with this email already exists');
        err.statusCode = 409;
        throw err;
      }

      const passwordHash = await bcrypt.hash(data.password || 'Teacher@123', 10);
      createdUser = await User.create({
        email: data.email.toLowerCase(),
        passwordHash,
        role: 'teacher',
        status: data.status || 'active',
      });
      data.userId = createdUser._id;
    }

    const teacher = await Teacher.create(data);

    await logAudit({
      req,
      action: 'CREATE_TEACHER',
      entityType: 'Teacher',
      entityId: teacher._id,
      changeSummary: { ...data, password: '[REDACTED]' },
    });

    return teacher;
  },

  async updateTeacher(id, data, req) {
    const teacher = await Teacher.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!teacher) {
      const err = new Error('Teacher not found');
      err.statusCode = 404;
      throw err;
    }

    if (teacher.userId && data.status) {
      await User.findByIdAndUpdate(teacher.userId, { status: data.status });
    }

    await logAudit({
      req,
      action: 'UPDATE_TEACHER',
      entityType: 'Teacher',
      entityId: teacher._id,
      changeSummary: data,
    });

    return teacher;
  },

  async deleteTeacher(id, req) {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      const err = new Error('Teacher not found');
      err.statusCode = 404;
      throw err;
    }

    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }
    await TeacherAssignment.deleteMany({ teacherId: id });
    await Teacher.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'DELETE_TEACHER',
      entityType: 'Teacher',
      entityId: id,
    });

    return { message: 'Teacher deleted successfully' };
  },

  async getMyAssignedClasses(teacherId) {
    const assignments = await TeacherAssignment.find({ teacherId, status: 'active' })
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name capacity')
      .populate('subjectId', 'name code maxMarks passingMarks');

    // Group by class and section
    const classesMap = new Map();
    assignments.forEach((assign) => {
      if (!assign.classId || !assign.sectionId) return;
      const key = `${assign.classId._id}_${assign.sectionId._id}`;
      if (!classesMap.has(key)) {
        classesMap.set(key, {
          classId: assign.classId._id,
          className: assign.classId.name,
          academicYear: assign.classId.academicYear,
          sectionId: assign.sectionId._id,
          sectionName: assign.sectionId.name,
          capacity: assign.sectionId.capacity,
          subjects: [],
        });
      }
      if (assign.subjectId) {
        classesMap.get(key).subjects.push({
          subjectId: assign.subjectId._id,
          name: assign.subjectId.name,
          code: assign.subjectId.code,
        });
      }
    });

    return Array.from(classesMap.values());
  },
};
