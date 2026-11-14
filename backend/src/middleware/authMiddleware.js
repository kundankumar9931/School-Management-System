import { verifyToken } from '../utils/token.js';
import { User, Teacher, Guardian } from '../models/index.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', [], 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, 'Invalid or expired token', [], 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User no longer exists', [], 401);
    }

    if (user.status !== 'active') {
      return sendError(res, 'Account has been deactivated', [], 403);
    }

    req.user = user;
    if (user.isDemo || decoded?.isDemo) {
      req.user.isDemo = true;
    }

    // Attach role-specific persona profiles for downstream access control
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id });
      req.teacher = teacher;
    } else if (user.role === 'guardian') {
      const guardian = await Guardian.findOne({ userId: user._id });
      req.guardian = guardian;
    }

    // Enforce strict read-only restrictions on demo accounts
    if (req.user.isDemo && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      const isDemoAuthPath =
        req.path === '/demo' ||
        req.path === '/logout' ||
        req.originalUrl?.includes('/auth/logout') ||
        req.originalUrl?.includes('/auth/demo');

      if (!isDemoAuthPath) {
        return sendError(
          res,
          'Demo mode is read-only. Modifying, creating, or deleting records is disabled to protect school data.',
          [],
          403
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
