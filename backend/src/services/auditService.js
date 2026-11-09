import { AuditLog } from '../models/index.js';

export const logAudit = async ({
  req,
  action,
  entityType,
  entityId = '',
  changeSummary = {},
}) => {
  try {
    // Sanitize summary to avoid sensitive credentials leaking
    const sanitizedSummary = JSON.parse(
      JSON.stringify(changeSummary, (key, value) => {
        if (/password|token|secret/i.test(key)) {
          return '[REDACTED]';
        }
        return value;
      })
    );

    const logEntry = {
      userId: req?.user?._id || null,
      userRole: req?.user?.role || 'system',
      userEmail: req?.user?.email || 'system',
      action,
      entityType,
      entityId: entityId ? String(entityId) : '',
      changeSummary: sanitizedSummary,
      requestId: req?.headers ? req.headers['x-request-id'] || '' : '',
      ipAddress: req?.ip || req?.socket?.remoteAddress || '',
      userAgent: req?.headers ? req.headers['user-agent'] || '' : '',
    };

    await AuditLog.create(logEntry);
  } catch (error) {
    // Audit logging should not crash business operations
    console.error('[AuditLog] Failed to record audit log:', error.message);
  }
};
