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

    // Attach role-specific persona profiles for downstream access control
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: user._id });
      req.teacher = teacher;
    } else if (user.role === 'guardian') {
      const guardian = await Guardian.findOne({ userId: user._id });
      req.guardian = guardian;
    }

    next();
  } catch (error) {
    next(error);
  }
};
