import { reportService } from '../services/reportService.js';
import { AuditLog } from '../models/index.js';
import { sendSuccess } from '../utils/response.js';

export const reportController = {
  async getDashboard(req, res, next) {
    try {
      const data = await reportService.getDashboardStats();
      return sendSuccess(res, 'Dashboard statistics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },

  async getAttendanceReport(req, res, next) {
    try {
      const data = await reportService.getAttendanceReports(req.query);
      return sendSuccess(res, 'Attendance report retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },

  async getAcademicReport(req, res, next) {
    try {
      const data = await reportService.getAcademicReports(req.query);
      return sendSuccess(res, 'Academic report retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },

  async getFeeReport(req, res, next) {
    try {
      const data = await reportService.getFeeReports(req.query);
      return sendSuccess(res, 'Fee report retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  },
};

export const auditController = {
  async getAllLogs(req, res, next) {
    try {
      const { page = 1, limit = 20, entityType, userRole, search } = req.query;
      const filter = {};
      if (entityType) filter.entityType = entityType;
      if (userRole) filter.userRole = userRole;
      if (search) {
        filter.$or = [
          { action: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { entityId: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit)),
        AuditLog.countDocuments(filter),
      ]);

      return sendSuccess(res, 'Audit logs retrieved successfully', {
        logs,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (error) {
      next(error);
    }
  },
};
