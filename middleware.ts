import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Security Features
 *
 * Features:
 * 1. IP Whitelisting for admin routes (optional)
 * 2. Additional security headers
 */

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Continue with the request
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Admin routes
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
