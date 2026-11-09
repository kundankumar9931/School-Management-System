import { attendanceService } from '../services/attendanceService.js';
import { sendSuccess } from '../utils/response.js';

export const attendanceController = {
  async recordAttendance(req, res, next) {
    try {
      const result = await attendanceService.recordAttendance({
        ...req.body,
        user: req.user,
        teacher: req.teacher,
        req,
      });
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getDailyAttendance(req, res, next) {
    try {
      const { classId, sectionId, date, session } = req.query;
      const result = await attendanceService.getDailyAttendance({
        classId,
        sectionId,
        date,
        session,
        user: req.user,
        teacher: req.teacher,
      });
      return sendSuccess(res, 'Daily attendance retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async getStudentSummary(req, res, next) {
    try {
      const result = await attendanceService.getStudentAttendanceSummary(req.params.studentId, {
        user: req.user,
        teacher: req.teacher,
        guardian: req.guardian,
      });
      return sendSuccess(res, 'Student attendance summary retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  },
};
