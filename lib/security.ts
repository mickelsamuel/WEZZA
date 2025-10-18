/**
 * Security Utilities
 * Helper functions for input validation, sanitization, and security checks
 */

import { z } from 'zod';

// ============================================================================
// EMAIL VALIDATION & SANITIZATION
// ============================================================================

/**
 * Validate and sanitize email addresses
 * Prevents email header injection attacks
 */
export function sanitizeEmail(email: string): string {
  // Remove any newlines, carriage returns, or null bytes
  const cleaned = email.replace(/[\r\n\0]/g, '');

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }

  return cleaned.toLowerCase().trim();
}

/**
 * Validate email with Zod schema
 */
export const emailSchema = z.string().email().transform(sanitizeEmail);

// ============================================================================
// HTML & TEXT SANITIZATION
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize text input - removes dangerous characters but preserves readability
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters except newlines and tabs
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize URL - ensures it's a valid http/https URL
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return parsed.href;
  } catch {
    throw new Error('Invalid URL format');
  }
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Strong password validation
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  return { valid: true };
}

export const passwordSchema = z.string().superRefine((password, ctx) => {
  const validation = validatePassword(password);
  if (!validation.valid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: validation.error || 'Invalid password',
    });
  }
});

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

/**
 * Product validation schema
 */
export const productSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(10000, 'Description must be less than 10,000 characters'),
  price: z.number()
    .int('Price must be an integer')
    .positive('Price must be positive')
    .max(99999999, 'Price is too large'),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
});

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeText),
  email: emailSchema,
  message: z.string()
    .min(1, 'Message is required')
    .max(5000, 'Message must be less than 5,000 characters')
    .transform(sanitizeText),
  imageUrl: z.string().url().optional().transform((url) => url ? sanitizeUrl(url) : undefined),
});

// ============================================================================
// ADMIN AUTHORIZATION
// ============================================================================

/**
 * Check if user has admin role (case-insensitive)
 */
export function isAdmin(role?: string | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'admin';
}

/**
 * Check if user has collaborator role (case-insensitive)
 */
export function isCollaborator(role?: string | null): boolean {
  if (!role) return false;
  return role.toLowerCase() === 'collaborator';
}

/**
 * Validate user role is one of the allowed values
 */
export const roleSchema = z.enum(['customer', 'admin', 'collaborator']);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Get safe error message for client
 * In production, hides detailed error messages
 */
export function getSafeErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error occurred';
}

/**
 * Log error with context (for server-side logging)
 */
export function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);

  // In production, you could send to error tracking service here
  // e.g., Sentry, LogRocket, etc.
}

// ============================================================================
// RATE LIMITING HELPERS
// ============================================================================

/**
 * Simple in-memory rate limiter (for development)
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Clean up expired rate limit records
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    rateLimitMap.forEach((record, key) => {
      if (now > record.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => rateLimitMap.delete(key));
  }, 60000); // Clean up every minute
}

// ============================================================================
// JSON VALIDATION
// ============================================================================

/**
 * Safely parse JSON with validation
 */
export function safeJsonParse<T>(
  json: string,
  validator?: (data: unknown) => data is T
): T | null {
  try {
    const parsed = JSON.parse(json);
    if (validator && !validator(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Validate array of URLs
 */
export function isUrlArray(data: unknown): data is string[] {
  return Array.isArray(data) && data.every(item => {
    if (typeof item !== 'string') return false;
    try {
      new URL(item);
      return true;
    } catch {
      return false;
    }
  });
}

// ============================================================================
// PASSWORD BREACH CHECKING
// ============================================================================

/**
 * Check if password has been compromised in data breaches
 * Uses HaveIBeenPwned API with k-anonymity (safe, doesn't send full password)
 *
 * @param password - The password to check
 * @returns Object with breached status and count
 */
export async function checkPasswordBreach(
  password: string
): Promise<{ breached: boolean; count: number }> {
  try {
    const crypto = await import('crypto');

    // Hash the password using SHA-1
    const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();

    // Use k-anonymity: only send first 5 characters of hash
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Query HaveIBeenPwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'WEZZA-Security-Check',
      },
    });

    if (!response.ok) {
      // If API fails, don't block the user (fail open)
      console.warn('HaveIBeenPwned API check failed:', response.status);
      return { breached: false, count: 0 };
    }

    const text = await response.text();
    const lines = text.split('\n');

    // Check if our hash suffix appears in the results
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix === suffix) {
        return { breached: true, count: parseInt(countStr, 10) };
      }
    }

    return { breached: false, count: 0 };
  } catch (error) {
    // If anything fails, don't block the user (fail open)
    console.error('Password breach check error:', error);
    return { breached: false, count: 0 };
  }
}

/**
 * Enhanced password strength analysis using zxcvbn
 * Returns a score from 0-4 (0 = weak, 4 = strong)
 */
export async function analyzePasswordStrength(password: string, userInputs: string[] = []): Promise<{
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
  crackTime: string | number;
}> {
  try {
    const zxcvbn = (await import('zxcvbn')).default;
    const result = zxcvbn(password, userInputs);

    return {
      score: result.score,
      feedback: {
        warning: result.feedback.warning || '',
        suggestions: result.feedback.suggestions || [],
      },
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second || 'unknown',
    };
  } catch (error) {
    console.error('Password strength analysis error:', error);
    // Fallback to basic validation
    const validation = validatePassword(password);
    return {
      score: validation.valid ? 2 : 0,
      feedback: {
        warning: validation.error || '',
        suggestions: [],
      },
      crackTime: 'unknown',
    };
  }
}

// ============================================================================
// REQUEST SIGNING (HMAC)
// ============================================================================

/**
 * Generate HMAC signature for request signing
 * Prevents request tampering and replay attacks
 */
export async function generateRequestSignature(
  payload: string | object,
  secret: string,
  timestamp?: number
): Promise<{ signature: string; timestamp: number }> {
  const crypto = await import('crypto');

  const ts = timestamp || Date.now();
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const message = `${ts}.${data}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  return { signature, timestamp: ts };
}

/**
 * Verify HMAC signature
 * Checks signature validity and prevents replay attacks (5 min window)
 */
export async function verifyRequestSignature(
  payload: string | object,
  signature: string,
  timestamp: number,
  secret: string,
  maxAgeMs: number = 300000 // 5 minutes
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check timestamp is within acceptable range (prevent replay attacks)
    const now = Date.now();
    if (now - timestamp > maxAgeMs) {
      return { valid: false, error: 'Signature expired' };
    }

    if (timestamp > now + 60000) {
      return { valid: false, error: 'Timestamp in future' };
    }

    // Generate expected signature
    const { signature: expectedSignature } = await generateRequestSignature(
      payload,
      secret,
      timestamp
    );

    // Use constant-time comparison to prevent timing attacks
    const crypto = await import('crypto');
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature' };
    }

    const valid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    return valid ? { valid: true } : { valid: false, error: 'Invalid signature' };
  } catch (error) {
    console.error('Signature verification error:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

// ============================================================================
// SECURITY EVENT LOGGING
// ============================================================================

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGIN_2FA_FAILED = 'login_2fa_failed',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGED = 'password_changed',
  ACCOUNT_LOCKED = 'account_locked',
  ADMIN_ACTION = 'admin_action',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log security events for monitoring and audit trail
 * In production, send to security monitoring service (Sentry, Datadog, etc.)
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Console log for development
  console.warn('[SECURITY EVENT]', {
    type: event.type,
    userId: event.userId,
    email: event.email,
    ip: event.ip,
    metadata: event.metadata,
  });

  // TODO: In production, send to security monitoring service
  // Example integrations:
  // - Sentry: Sentry.captureMessage()
  // - Datadog: datadogLogs.logger.warn()
  // - Custom API: fetch('/api/security-events', { method: 'POST', body: JSON.stringify(fullEvent) })

  // For now, we'll store in audit log via database (implemented in Phase 3)
  // This is a hook point for future audit log database integration
}

/**
 * Track failed login attempts for account lockout
 */
const failedLoginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function trackFailedLogin(identifier: string): {
  count: number;
  shouldLock: boolean;
  resetIn?: number;
} {
  const now = Date.now();
  const record = failedLoginAttempts.get(identifier);

  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (!record || now - record.firstAttempt > windowMs) {
    failedLoginAttempts.set(identifier, { count: 1, firstAttempt: now });
    return { count: 1, shouldLock: false };
  }

  record.count++;

  if (record.count >= maxAttempts) {
    logSecurityEvent({
      type: SecurityEventType.ACCOUNT_LOCKED,
      email: identifier,
      metadata: { attempts: record.count },
    });

    return {
      count: record.count,
      shouldLock: true,
      resetIn: windowMs - (now - record.firstAttempt),
    };
  }

  return { count: record.count, shouldLock: false };
}

export function clearFailedLoginAttempts(identifier: string): void {
  failedLoginAttempts.delete(identifier);
}

/**
 * Clean up expired failed login records
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;

    failedLoginAttempts.forEach((record, key) => {
      if (now - record.firstAttempt > windowMs) {
        failedLoginAttempts.delete(key);
      }
    });
  }, 60000); // Clean up every minute
}

// ============================================================================
// IP VALIDATION & WHITELISTING
// ============================================================================

/**
 * Check if IP address is in whitelist
 * Supports individual IPs and CIDR notation
 */
export function isIpWhitelisted(ip: string, whitelist: string[]): boolean {
  if (whitelist.length === 0) return true; // Empty whitelist = allow all

  // Normalize IP (remove IPv6 prefix if present)
  const normalizedIp = ip.replace('::ffff:', '');

  for (const entry of whitelist) {
    if (entry === normalizedIp) return true;

    // Check CIDR notation (basic implementation)
    if (entry.includes('/')) {
      // For simplicity, we'll just check prefix match
      // In production, use a proper CIDR library like 'ip-range-check'
      const [network] = entry.split('/');
      if (normalizedIp.startsWith(network.substring(0, network.lastIndexOf('.')))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extract client IP from request headers
 * Handles proxies, load balancers, and CDNs
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
