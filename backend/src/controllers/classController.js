import { classService, assignmentService } from '../services/classService.js';
import { sendSuccess } from '../utils/response.js';

export const classController = {
  // Classes
  async getAllClasses(req, res, next) {
    try {
      const classes = await classService.getAllClasses(req.query);
      return sendSuccess(res, 'Classes retrieved successfully', classes);
    } catch (error) {
      next(error);
    }
  },

  async getClassById(req, res, next) {
    try {
      const cls = await classService.getClassById(req.params.id);
      return sendSuccess(res, 'Class retrieved successfully', cls);
    } catch (error) {
      next(error);
    }
  },

  async createClass(req, res, next) {
    try {
      const cls = await classService.createClass(req.body, req);
      return sendSuccess(res, 'Class created successfully', cls, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateClass(req, res, next) {
    try {
      const cls = await classService.updateClass(req.params.id, req.body, req);
      return sendSuccess(res, 'Class updated successfully', cls);
    } catch (error) {
      next(error);
    }
  },

  async deleteClass(req, res, next) {
    try {
      const result = await classService.deleteClass(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  // Sections
  async getAllSections(req, res, next) {
    try {
      const sections = await classService.getAllSections(req.query);
      return sendSuccess(res, 'Sections retrieved successfully', sections);
    } catch (error) {
      next(error);
    }
  },

  async createSection(req, res, next) {
    try {
      const section = await classService.createSection(req.body, req);
      return sendSuccess(res, 'Section created successfully', section, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateSection(req, res, next) {
    try {
      const section = await classService.updateSection(req.params.id, req.body, req);
      return sendSuccess(res, 'Section updated successfully', section);
    } catch (error) {
      next(error);
    }
  },

  async deleteSection(req, res, next) {
    try {
      const result = await classService.deleteSection(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  // Subjects
  async getAllSubjects(req, res, next) {
    try {
      const subjects = await classService.getAllSubjects();
      return sendSuccess(res, 'Subjects retrieved successfully', subjects);
    } catch (error) {
      next(error);
    }
  },

  async getSubjectById(req, res, next) {
    try {
      const subject = await classService.getSubjectById(req.params.id);
      return sendSuccess(res, 'Subject retrieved successfully', subject);
    } catch (error) {
      next(error);
    }
  },

  async createSubject(req, res, next) {
    try {
      const subject = await classService.createSubject(req.body, req);
      return sendSuccess(res, 'Subject created successfully', subject, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateSubject(req, res, next) {
    try {
      const subject = await classService.updateSubject(req.params.id, req.body, req);
      return sendSuccess(res, 'Subject updated successfully', subject);
    } catch (error) {
      next(error);
    }
  },

  async deleteSubject(req, res, next) {
    try {
      const result = await classService.deleteSubject(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  // Teacher Assignments
  async getAllAssignments(req, res, next) {
    try {
      const assignments = await assignmentService.getAssignments(req.query);
      return sendSuccess(res, 'Assignments retrieved successfully', assignments);
    } catch (error) {
      next(error);
    }
  },

  async createAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.createAssignment(req.body, req);
      return sendSuccess(res, 'Assignment created successfully', assignment, 201);
    } catch (error) {
      next(error);
    }
  },

  async deleteAssignment(req, res, next) {
    try {
      const result = await assignmentService.deleteAssignment(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },
};
