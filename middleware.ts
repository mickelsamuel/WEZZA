import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createCsrfProtect } from '@edge-csrf/nextjs';

/**
 * Next.js Middleware for Security Features
 *
 * Features:
 * 1. CSRF Protection for state-changing requests
 * 2. IP Whitelisting for admin routes (optional)
 * 3. Additional security headers
 */

// Initialize CSRF protection
const csrfProtect = createCsrfProtect({
  cookie: {
    name: '__Host-csrf-token',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
});

// IP Whitelist configuration (optional - disabled if not set)
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST
  ? process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim())
  : [];

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers that proxies/load balancers might set
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) return cfConnectingIp;

  return 'unknown';
}

/**
 * Check if IP is whitelisted
 */
function isIpWhitelisted(ip: string): boolean {
  // If whitelist is empty, allow all (feature disabled)
  if (ADMIN_IP_WHITELIST.length === 0) return true;

  // Normalize IP (remove IPv6 prefix if present)
  const normalizedIp = ip.replace('::ffff:', '');

  // Check exact match
  if (ADMIN_IP_WHITELIST.includes(normalizedIp)) return true;

  // Check CIDR notation (basic implementation)
  for (const entry of ADMIN_IP_WHITELIST) {
    if (entry.includes('/')) {
      const [network] = entry.split('/');
      const networkPrefix = network.substring(0, network.lastIndexOf('.'));
      if (normalizedIp.startsWith(networkPrefix)) {
        return true;
      }
    }
  }

  // Special case: allow localhost in development
  if (
    process.env.NODE_ENV !== 'production' &&
    (normalizedIp === '127.0.0.1' || normalizedIp === 'localhost' || normalizedIp === '::1')
  ) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();

  // CSRF Protection for state-changing requests (POST, PUT, DELETE, PATCH)
  // Skip CSRF for:
  // - GET, HEAD, OPTIONS requests (safe methods)
  // - Webhook endpoints (they use signature verification)
  // - NextAuth endpoints (they have their own CSRF protection)
  // - Cart endpoints (require authentication, user-specific)
  // - Admin API endpoints (protected by auth + role checks + optional IP whitelist)
  // - Account endpoints (require authentication, user-specific)
  // - Checkout endpoints (require authentication)
  const method = request.method;
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isWebhook = pathname.startsWith('/api/webhooks/');
  const isNextAuth = pathname.startsWith('/api/auth/');
  const isCart = pathname.startsWith('/api/cart');
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isAccountApi = pathname.startsWith('/api/account/');
  const isCheckout = pathname.startsWith('/api/checkout');

  if (isStateChanging && !isWebhook && !isNextAuth && !isCart && !isAdminApi && !isAccountApi && !isCheckout) {
    try {
      await csrfProtect(request, response);
    } catch (error) {
      console.warn(`[SECURITY] CSRF validation failed for ${pathname}`);
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid CSRF token',
          message: 'Your session may have expired. Please refresh the page and try again.',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // IP Whitelisting for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const clientIp = getClientIp(request);

    if (!isIpWhitelisted(clientIp)) {
      console.warn(`[SECURITY] Blocked admin access from non-whitelisted IP: ${clientIp}`);

      // Return 403 Forbidden
      return new NextResponse(
        JSON.stringify({
          error: 'Access denied',
          message: 'Your IP address is not whitelisted for admin access',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Log successful admin access
    if (ADMIN_IP_WHITELIST.length > 0) {
      console.log(`[SECURITY] Admin access granted to whitelisted IP: ${clientIp}`);
    }
  }

  // Return response with CSRF token
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Admin routes (IP whitelisting)
    '/admin/:path*',
    '/api/admin/:path*',
    // API routes (CSRF protection)
    '/api/:path*',
  ],
};
