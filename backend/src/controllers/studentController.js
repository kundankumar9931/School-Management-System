import { studentService } from '../services/studentService.js';
import { sendSuccess } from '../utils/response.js';

export const studentController = {
  async getAll(req, res, next) {
    try {
      const result = await studentService.getAllStudents({
        ...req.query,
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Students retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id, {
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Student retrieved successfully', student);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body, req);
      return sendSuccess(res, 'Student created successfully', student, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const student = await studentService.updateStudent(req.params.id, req.body, req);
      return sendSuccess(res, 'Student updated successfully', student);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await studentService.deleteStudent(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  async getAcademicHistory(req, res, next) {
    try {
      const results = await studentService.getStudentAcademicHistory(req.params.id, {
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Academic history retrieved successfully', results);
    } catch (error) {
      next(error);
    }
  },

  async getAttendanceHistory(req, res, next) {
    try {
      const attendance = await studentService.getStudentAttendanceHistory(req.params.id, {
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Attendance history retrieved successfully', attendance);
    } catch (error) {
      next(error);
    }
  },

  async getFeeHistory(req, res, next) {
    try {
      const fees = await studentService.getStudentFeeHistory(req.params.id, {
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Fee history retrieved successfully', fees);
    } catch (error) {
      next(error);
    }
  },
};
