import { guardianService } from '../services/guardianService.js';
import { sendSuccess } from '../utils/response.js';

export const guardianController = {
  async getAll(req, res, next) {
    try {
      const guardians = await guardianService.getAllGuardians(req.query);
      return sendSuccess(res, 'Guardians retrieved successfully', guardians);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const guardian = await guardianService.getGuardianById(req.params.id);
      return sendSuccess(res, 'Guardian retrieved successfully', guardian);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const guardian = await guardianService.createGuardian(req.body, req);
      return sendSuccess(res, 'Guardian created successfully', guardian, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const guardian = await guardianService.updateGuardian(req.params.id, req.body, req);
      return sendSuccess(res, 'Guardian updated successfully', guardian);
    } catch (error) {
      next(error);
    }
  },

  async getMyChildren(req, res, next) {
    try {
      const children = await guardianService.getMyChildren(req.user._id);
      return sendSuccess(res, 'Children retrieved successfully', children);
    } catch (error) {
      next(error);
    }
  },
};
