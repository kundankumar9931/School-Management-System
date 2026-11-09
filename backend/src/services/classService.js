import { Class, Section, Subject, TeacherAssignment, Teacher } from '../models/index.js';
import { logAudit } from './auditService.js';

export const classService = {
  // Classes
  async getAllClasses(query = {}) {
    const filter = {};
    if (query.academicYear) filter.academicYear = query.academicYear;
    return Class.find(filter).populate('classTeacherId', 'fullName email employeeId').sort({ name: 1 });
  },

  async getClassById(id) {
    const cls = await Class.findById(id).populate('classTeacherId', 'fullName email employeeId');
    if (!cls) {
      const err = new Error('Class not found');
      err.statusCode = 404;
      throw err;
    }
    const sections = await Section.find({ classId: id }).sort({ name: 1 });
    return { ...cls.toObject(), sections };
  },

  async createClass(data, req) {
    const cls = await Class.create(data);
    await logAudit({
      req,
      action: 'CREATE_CLASS',
      entityType: 'Class',
      entityId: cls._id,
      changeSummary: data,
    });
    return cls;
  },

  async updateClass(id, data, req) {
    const cls = await Class.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!cls) {
      const err = new Error('Class not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'UPDATE_CLASS',
      entityType: 'Class',
      entityId: cls._id,
      changeSummary: data,
    });
    return cls;
  },

  async deleteClass(id, req) {
    const cls = await Class.findByIdAndDelete(id);
    if (!cls) {
      const err = new Error('Class not found');
      err.statusCode = 404;
      throw err;
    }
    // Clean up sections under this class
    await Section.deleteMany({ classId: id });
    await logAudit({
      req,
      action: 'DELETE_CLASS',
      entityType: 'Class',
      entityId: id,
    });
    return { message: 'Class deleted successfully' };
  },

  // Sections
  async getAllSections(query = {}) {
    const filter = {};
    if (query.classId) filter.classId = query.classId;
    return Section.find(filter).populate('classId', 'name academicYear').sort({ name: 1 });
  },

  async createSection(data, req) {
    const parentClass = await Class.findById(data.classId);
    if (!parentClass) {
      const err = new Error('Referenced class not found');
      err.statusCode = 404;
      throw err;
    }
    const section = await Section.create(data);
    await logAudit({
      req,
      action: 'CREATE_SECTION',
      entityType: 'Section',
      entityId: section._id,
      changeSummary: data,
    });
    return section;
  },

  async updateSection(id, data, req) {
    const section = await Section.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!section) {
      const err = new Error('Section not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'UPDATE_SECTION',
      entityType: 'Section',
      entityId: section._id,
      changeSummary: data,
    });
    return section;
  },

  async deleteSection(id, req) {
    const section = await Section.findByIdAndDelete(id);
    if (!section) {
      const err = new Error('Section not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'DELETE_SECTION',
      entityType: 'Section',
      entityId: id,
    });
    return { message: 'Section deleted successfully' };
  },

  // Subjects
  async getAllSubjects() {
    return Subject.find().sort({ name: 1 });
  },

  async getSubjectById(id) {
    const subject = await Subject.findById(id);
    if (!subject) {
      const err = new Error('Subject not found');
      err.statusCode = 404;
      throw err;
    }
    return subject;
  },

  async createSubject(data, req) {
    const subject = await Subject.create(data);
    await logAudit({
      req,
      action: 'CREATE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id,
      changeSummary: data,
    });
    return subject;
  },

  async updateSubject(id, data, req) {
    const subject = await Subject.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!subject) {
      const err = new Error('Subject not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'UPDATE_SUBJECT',
      entityType: 'Subject',
      entityId: subject._id,
      changeSummary: data,
    });
    return subject;
  },

  async deleteSubject(id, req) {
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      const err = new Error('Subject not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'DELETE_SUBJECT',
      entityType: 'Subject',
      entityId: id,
    });
    return { message: 'Subject deleted successfully' };
  },
};

export const assignmentService = {
  async getAssignments(query = {}) {
    const filter = {};
    if (query.teacherId) filter.teacherId = query.teacherId;
    if (query.classId) filter.classId = query.classId;
    if (query.sectionId) filter.sectionId = query.sectionId;
    if (query.subjectId) filter.subjectId = query.subjectId;
    if (query.academicYear) filter.academicYear = query.academicYear;

    return TeacherAssignment.find(filter)
      .populate('teacherId', 'fullName email employeeId')
      .populate('classId', 'name academicYear')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });
  },

  async createAssignment(data, req) {
    // Validate existence of all references
    const [teacher, cls, section, subject] = await Promise.all([
      Teacher.findById(data.teacherId),
      Class.findById(data.classId),
      Section.findById(data.sectionId),
      Subject.findById(data.subjectId),
    ]);

    if (!teacher) {
      const err = new Error('Teacher not found');
      err.statusCode = 404;
      throw err;
    }
    if (!cls) {
      const err = new Error('Class not found');
      err.statusCode = 404;
      throw err;
    }
    if (!section || section.classId.toString() !== data.classId.toString()) {
      const err = new Error('Section does not belong to the specified class');
      err.statusCode = 400;
      throw err;
    }
    if (!subject) {
      const err = new Error('Subject not found');
      err.statusCode = 404;
      throw err;
    }

    const assignment = await TeacherAssignment.create(data);
    await logAudit({
      req,
      action: 'CREATE_ASSIGNMENT',
      entityType: 'TeacherAssignment',
      entityId: assignment._id,
      changeSummary: data,
    });

    return assignment.populate([
      { path: 'teacherId', select: 'fullName email employeeId' },
      { path: 'classId', select: 'name' },
      { path: 'sectionId', select: 'name' },
      { path: 'subjectId', select: 'name code' },
    ]);
  },

  async deleteAssignment(id, req) {
    const assignment = await TeacherAssignment.findByIdAndDelete(id);
    if (!assignment) {
      const err = new Error('Assignment not found');
      err.statusCode = 404;
      throw err;
    }
    await logAudit({
      req,
      action: 'DELETE_ASSIGNMENT',
      entityType: 'TeacherAssignment',
      entityId: id,
    });
    return { message: 'Assignment deleted successfully' };
  },

  async isTeacherAssignedToClass({ teacherId, classId, sectionId }) {
    const filter = { teacherId, classId, status: 'active' };
    if (sectionId) {
      filter.sectionId = sectionId;
    }
    const assignment = await TeacherAssignment.findOne(filter);
    return Boolean(assignment);
  },

  async isTeacherAssignedToSubject({ teacherId, classId, sectionId, subjectId }) {
    const filter = { teacherId, classId, subjectId, status: 'active' };
    if (sectionId) {
      filter.sectionId = sectionId;
    }
    const assignment = await TeacherAssignment.findOne(filter);
    return Boolean(assignment);
  },
};
