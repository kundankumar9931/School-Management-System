import { authService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login({ email, password, req });

      // Set secure HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(res, 'Login successful', { token, user });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    res.clearCookie('token');
    return sendSuccess(res, 'Logout successful', {});
  },

  async me(req, res, next) {
    try {
      const userData = await authService.getMe(req.user._id);
      return sendSuccess(res, 'User profile retrieved successfully', userData);
    } catch (error) {
      next(error);
    }
  },
};
