import { Student, Attendance, Result, FeeInvoice, Guardian, TeacherAssignment } from '../models/index.js';
import { logAudit } from './auditService.js';

export const studentService = {
  async getAllStudents({
    page = 1,
    limit = 10,
    search = '',
    classId = '',
    sectionId = '',
    status = '',
    user,
    teacher,
    guardian,
  }) {
    const filter = {};

    // Role-based scope restrictions
    if (user.role === 'guardian') {
      if (!guardian) {
        return { students: [], total: 0, page: 1, totalPages: 0 };
      }
      filter._id = { $in: guardian.linkedStudentIds };
    } else if (user.role === 'teacher') {
      if (!teacher) {
        return { students: [], total: 0, page: 1, totalPages: 0 };
      }
      // Find classes and sections assigned to teacher
      const assignments = await TeacherAssignment.find({ teacherId: teacher._id, status: 'active' });
      const allowedSectionIds = assignments.map((a) => a.sectionId);
      filter.sectionId = { $in: allowedSectionIds };
    }

    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('classId', 'name academicYear')
        .populate('sectionId', 'name')
        .populate('guardianId', 'fullName email phone relationship')
        .sort({ admissionNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  },

  async getStudentById(id, { user, teacher, guardian }) {
    const student = await Student.findById(id)
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('guardianId', 'fullName email phone relationship address');

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    // Role ownership check
    if (user.role === 'guardian') {
      const isLinked = guardian?.linkedStudentIds?.some(
        (childId) => childId.toString() === student._id.toString()
      );
      if (!isLinked) {
        const err = new Error('Access denied. You can only access your linked children.');
        err.statusCode = 403;
        throw err;
      }
    } else if (user.role === 'teacher') {
      const isAssigned = await TeacherAssignment.findOne({
        teacherId: teacher._id,
        sectionId: student.sectionId._id,
        status: 'active',
      });
      if (!isAssigned) {
        const err = new Error('Access denied. You can only view students in your assigned classes.');
        err.statusCode = 403;
        throw err;
      }
    }

    return student;
  },

  async createStudent(data, req) {
    const student = await Student.create(data);

    // If guardianId provided, update Guardian's linkedStudentIds
    if (data.guardianId) {
      await Guardian.findByIdAndUpdate(data.guardianId, {
        $addToSet: { linkedStudentIds: student._id },
      });
    }

    await logAudit({
      req,
      action: 'CREATE_STUDENT',
      entityType: 'Student',
      entityId: student._id,
      changeSummary: data,
    });

    return student.populate([
      { path: 'classId', select: 'name academicYear' },
      { path: 'sectionId', select: 'name' },
      { path: 'guardianId', select: 'fullName email phone relationship' },
    ]);
  },

  async updateStudent(id, data, req) {
    const oldStudent = await Student.findById(id);
    if (!oldStudent) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    // If guardian changed, update both guardian documents
    if (data.guardianId && data.guardianId.toString() !== oldStudent.guardianId?.toString()) {
      if (oldStudent.guardianId) {
        await Guardian.findByIdAndUpdate(oldStudent.guardianId, {
          $pull: { linkedStudentIds: oldStudent._id },
        });
      }
      await Guardian.findByIdAndUpdate(data.guardianId, {
        $addToSet: { linkedStudentIds: oldStudent._id },
      });
    }

    const student = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('guardianId', 'fullName email phone relationship');

    await logAudit({
      req,
      action: 'UPDATE_STUDENT',
      entityType: 'Student',
      entityId: student._id,
      changeSummary: data,
    });

    return student;
  },

  async deleteStudent(id, req) {
    const student = await Student.findById(id);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    if (student.guardianId) {
      await Guardian.findByIdAndUpdate(student.guardianId, {
        $pull: { linkedStudentIds: student._id },
      });
    }

    await Student.findByIdAndDelete(id);

    await logAudit({
      req,
      action: 'DELETE_STUDENT',
      entityType: 'Student',
      entityId: id,
    });

    return { message: 'Student removed successfully' };
  },

  async getStudentAcademicHistory(id, { user, teacher, guardian }) {
    await this.getStudentById(id, { user, teacher, guardian });

    const results = await Result.find({ studentId: id })
      .populate('examId', 'name examType academicYear startDate endDate')
      .populate('subjectId', 'name code maxMarks passingMarks')
      .populate('evaluatedByTeacherId', 'fullName employeeId')
      .sort({ createdAt: -1 });

    return results;
  },

  async getStudentAttendanceHistory(id, { user, teacher, guardian }) {
    await this.getStudentById(id, { user, teacher, guardian });

    const attendance = await Attendance.find({ studentId: id })
      .sort({ date: -1 })
      .limit(60);

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.status === 'Present').length;
    const percentage = totalDays > 0 ? Number(((presentDays / totalDays) * 100).toFixed(1)) : 0;

    return {
      totalDays,
      presentDays,
      percentage,
      history: attendance,
    };
  },

  async getStudentFeeHistory(id, { user, teacher, guardian }) {
    await this.getStudentById(id, { user, teacher, guardian });

    const invoices = await FeeInvoice.find({ studentId: id })
      .populate('feeStructureId', 'name feeType academicYear amount')
      .sort({ dueDate: -1 });

    return invoices;
  },
};
