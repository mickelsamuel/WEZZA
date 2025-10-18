/**
 * Audit Logging Utilities
 * Provides functions for creating audit trail records
 */

import { prisma } from './prisma';
import { getClientIp } from './security';

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',
  TWO_FACTOR_SETUP_INITIATED = 'two_factor_setup_initiated',
  TWO_FACTOR_VERIFICATION_FAILED = 'two_factor_verification_failed',
  TWO_FACTOR_DISABLE_FAILED = 'two_factor_disable_failed',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_ROLE_CHANGED = 'user_role_changed',
  ACCOUNT_DELETED = 'account_deleted',

  // Product Management
  PRODUCT_CREATED = 'product_created',
  PRODUCT_UPDATED = 'product_updated',
  PRODUCT_DELETED = 'product_deleted',
  INVENTORY_UPDATED = 'inventory_updated',

  // Order Management
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_STATUS_CHANGED = 'order_status_changed',
  ORDER_CANCELLED = 'order_cancelled',

  // Collections
  COLLECTION_CREATED = 'collection_created',
  COLLECTION_UPDATED = 'collection_updated',
  COLLECTION_DELETED = 'collection_deleted',

  // Site Content
  SITE_CONTENT_UPDATED = 'site_content_updated',
  SITE_IMAGE_UPDATED = 'site_image_updated',

  // Email
  EMAIL_TEMPLATE_UPDATED = 'email_template_updated',
  EMAIL_CAMPAIGN_SENT = 'email_campaign_sent',

  // Security Events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  ACCOUNT_LOCKED = 'account_locked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface AuditLogData {
  action: AuditAction | string;
  userId?: string;
  userEmail?: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity?: AuditSeverity;
}

/**
 * Create an audit log entry
 * Automatically extracts IP and user agent from headers if provided
 */
export async function createAuditLog(
  data: AuditLogData,
  headers?: Headers
): Promise<void> {
  try {
    const ipAddress = headers ? getClientIp(headers) : data.ipAddress;
    const userAgent = headers?.get('user-agent') || data.userAgent;

    await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        userEmail: data.userEmail,
        resource: data.resource,
        resourceId: data.resourceId,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
        severity: data.severity || AuditSeverity.INFO,
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUDIT]', {
        action: data.action,
        user: data.userEmail || data.userId,
        resource: data.resource,
        resourceId: data.resourceId,
      });
    }
  } catch (error) {
    // Don't throw error - audit logging should never break the application
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  action: AuditAction,
  email: string,
  success: boolean,
  headers?: Headers,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(
    {
      action,
      userEmail: email,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      metadata,
    },
    headers
  );
}

/**
 * Log admin actions (product/order/user changes)
 */
export async function logAdminAction(
  action: AuditAction,
  adminUserId: string,
  adminEmail: string,
  resource: string,
  resourceId: string,
  headers?: Headers,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(
    {
      action,
      userId: adminUserId,
      userEmail: adminEmail,
      resource,
      resourceId,
      severity: AuditSeverity.INFO,
      metadata,
    },
    headers
  );
}

/**
 * Log security events (suspicious activity, rate limits, etc.)
 */
export async function logSecurityEvent(
  action: AuditAction | string,
  severity: AuditSeverity,
  headers?: Headers,
  metadata?: Record<string, any>
): Promise<void> {
  await createAuditLog(
    {
      action,
      severity,
      metadata,
    },
    headers
  );
}

/**
 * Query audit logs (for admin dashboard)
 */
export async function getAuditLogs(filters: {
  userId?: string;
  userEmail?: string;
  action?: string;
  resource?: string;
  severity?: AuditSeverity;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.userEmail) where.userEmail = { contains: filters.userEmail, mode: 'insensitive' };
  if (filters.action) where.action = filters.action;
  if (filters.resource) where.resource = filters.resource;
  if (filters.severity) where.severity = filters.severity;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get audit log statistics (for dashboard)
 */
export async function getAuditLogStats(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalLogs, criticalCount, warningCount, recentActions] = await Promise.all([
    // Total logs in period
    prisma.auditLog.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Critical events
    prisma.auditLog.count({
      where: {
        severity: AuditSeverity.CRITICAL,
        createdAt: { gte: startDate },
      },
    }),

    // Warning events
    prisma.auditLog.count({
      where: {
        severity: AuditSeverity.WARNING,
        createdAt: { gte: startDate },
      },
    }),

    // Most common actions
    prisma.$queryRaw`
      SELECT action, COUNT(*) as count
      FROM "AuditLog"
      WHERE "createdAt" >= ${startDate}
      GROUP BY action
      ORDER BY count DESC
      LIMIT 10
    `,
  ]);

  return {
    totalLogs,
    criticalCount,
    warningCount,
    recentActions,
  };
}
