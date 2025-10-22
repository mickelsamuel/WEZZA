/**
 * Environment Variable Validation
 * Ensures all required environment variables are set at startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'ETRANSFER_EMAIL', // Email address to receive e-transfers
] as const;

const optionalEnvVars = [
  'CRON_SECRET', // Required for production cron endpoints
  'GOOGLE_CLIENT_ID', // Optional for OAuth
  'GOOGLE_CLIENT_SECRET', // Optional for OAuth
  'UPSTASH_REDIS_REST_URL', // Recommended for production rate limiting
  'UPSTASH_REDIS_REST_TOKEN', // Recommended for production rate limiting
  'ADMIN_IP_WHITELIST', // Optional for enhanced admin security
  'SENTRY_DSN', // Optional for error tracking
  'ETRANSFER_SECURITY_QUESTION', // Optional security question for e-transfer
  'ETRANSFER_SECURITY_ANSWER', // Optional security answer for e-transfer
] as const;

export function validateEnvVars() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  // Check optional but recommended variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CRON_SECRET) {
      warnings.push('CRON_SECRET is not set - cron endpoints will be vulnerable');
    }
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      warnings.push('Redis not configured - using in-memory rate limiting (not recommended for production)');
    }
    if (!process.env.ADMIN_IP_WHITELIST) {
      warnings.push('ADMIN_IP_WHITELIST not set - admin panel accessible from any IP');
    }
    if (!process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not set - error tracking disabled');
    }
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  // Throw error if required variables are missing
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}\n\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  console.log('✅ Environment variables validated successfully');
}

// Auto-validate in development and production
if (process.env.NODE_ENV !== 'test') {
  validateEnvVars();
}
