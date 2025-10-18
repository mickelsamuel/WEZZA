/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // SECURITY: HTTP Security Headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Next.js requires 'unsafe-eval' and 'unsafe-inline' in dev, Stripe needs its domains
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
              // Styles: 'unsafe-inline' needed for CSS-in-JS and component styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Images: Allow data URIs for QR codes, blob for canvas, https for CDNs (limit http: for security)
              "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
              // Fonts: Google Fonts + data URIs
              "font-src 'self' data: https://fonts.gstatic.com",
              // API connections: Stripe, Cloudinary, password breach checking
              "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://res.cloudinary.com https://api.cloudinary.com https://api.pwnedpasswords.com",
              // Frames: Only Stripe checkout
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              // Media: No media sources allowed
              "media-src 'none'",
              // Objects/Embeds: No plugins allowed (Flash, Java, etc.)
              "object-src 'none'",
              // Web Workers: Only from same origin
              "worker-src 'self' blob:",
              // Manifests: Only from same origin
              "manifest-src 'self'",
              // Base URI: Prevent injection of <base> tags
              "base-uri 'self'",
              // Form submissions: Only to same origin
              "form-action 'self'",
              // Framing: Only allow same origin (clickjacking protection)
              "frame-ancestors 'self'",
              // Upgrade all HTTP to HTTPS
              "upgrade-insecure-requests",
              // Block all mixed content
              "block-all-mixed-content",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

export default nextConfig;
