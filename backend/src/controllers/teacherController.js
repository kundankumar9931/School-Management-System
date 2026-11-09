import { teacherService } from '../services/teacherService.js';
import { sendSuccess } from '../utils/response.js';

export const teacherController = {
  async getAll(req, res, next) {
    try {
      const teachers = await teacherService.getAllTeachers(req.query);
      return sendSuccess(res, 'Teachers retrieved successfully', teachers);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const teacher = await teacherService.getTeacherById(req.params.id);
      return sendSuccess(res, 'Teacher retrieved successfully', teacher);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const teacher = await teacherService.createTeacher(req.body, req);
      return sendSuccess(res, 'Teacher created successfully', teacher, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const teacher = await teacherService.updateTeacher(req.params.id, req.body, req);
      return sendSuccess(res, 'Teacher updated successfully', teacher);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await teacherService.deleteTeacher(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  async getMyClasses(req, res, next) {
    try {
      if (!req.teacher) {
        return sendSuccess(res, 'No teacher profile linked', []);
      }
      const classes = await teacherService.getMyAssignedClasses(req.teacher._id);
      return sendSuccess(res, 'Assigned classes retrieved successfully', classes);
    } catch (error) {
      next(error);
    }
  },
};
