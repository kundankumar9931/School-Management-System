import { sendError } from '../utils/response.js';

export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, 'Validation failed', formattedErrors, 400);
      }
      return sendError(res, error.message || 'Validation error', [], 400);
    }
  };
};
