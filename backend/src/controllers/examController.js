import { examService } from '../services/examService.js';
import { GradingRule } from '../models/index.js';
import { sendSuccess } from '../utils/response.js';

export const examController = {
  async getAllExams(req, res, next) {
    try {
      const exams = await examService.getAllExams(req.query);
      return sendSuccess(res, 'Examinations retrieved successfully', exams);
    } catch (error) {
      next(error);
    }
  },

  async getExamById(req, res, next) {
    try {
      const exam = await examService.getExamById(req.params.id);
      return sendSuccess(res, 'Examination retrieved successfully', exam);
    } catch (error) {
      next(error);
    }
  },

  async createExam(req, res, next) {
    try {
      const exam = await examService.createExam(req.body, req);
      return sendSuccess(res, 'Examination created successfully', exam, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateExam(req, res, next) {
    try {
      const exam = await examService.updateExam(req.params.id, req.body, req);
      return sendSuccess(res, 'Examination updated successfully', exam);
    } catch (error) {
      next(error);
    }
  },

  async deleteExam(req, res, next) {
    try {
      const result = await examService.deleteExam(req.params.id, req);
      return sendSuccess(res, result.message, {});
    } catch (error) {
      next(error);
    }
  },

  async submitMarks(req, res, next) {
    try {
      const results = await examService.submitMarks({
        ...req.body,
        user: req.user,
        teacher: req.teacher,
        req,
      });
      return sendSuccess(res, 'Marks entered and grades calculated successfully', results, 201);
    } catch (error) {
      next(error);
    }
  },

  async getResults(req, res, next) {
    try {
      const results = await examService.getResults({
        ...req.query,
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Results retrieved successfully', results);
    } catch (error) {
      next(error);
    }
  },

  async getReportCard(req, res, next) {
    try {
      const reportCard = await examService.getStudentReportCard(
        req.params.studentId,
        req.params.examId,
        {
          user: req.user,
          teacher: req.teacher,
          guardian: req.guardian,
        }
      );
      return sendSuccess(res, 'Report card generated successfully', reportCard);
    } catch (error) {
      next(error);
    }
  },

  // Grading Rules
  async getGradingRules(req, res, next) {
    try {
      const rules = await GradingRule.find().sort({ minPercentage: -1 });
      return sendSuccess(res, 'Grading rules retrieved successfully', rules);
    } catch (error) {
      next(error);
    }
  },

  async createGradingRule(req, res, next) {
    try {
      const rule = await GradingRule.create(req.body);
      return sendSuccess(res, 'Grading rule created successfully', rule, 201);
    } catch (error) {
      next(error);
    }
  },
};
