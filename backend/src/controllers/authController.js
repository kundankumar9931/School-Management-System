
import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const authController = {
  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { token, user } = await authService.login({
        email,
        password,
        req,
      });

      res.cookie('token', token, COOKIE_OPTIONS);

      return sendSuccess(res, 'Login successful', {
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Logout user
  async logout(req, res) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return sendSuccess(res, 'Logout successful', {});
  },

  // Get current logged-in user
  async me(req, res, next) {
    try {
      const userData = await authService.getMe(req.user._id);

      return sendSuccess(
        res,
        'User profile retrieved successfully',
        userData
      );
    } catch (error) {
      next(error);
    }
  },
};
