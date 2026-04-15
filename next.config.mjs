/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.firebaseio.com *.kakao.com cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net",
      "img-src 'self' data: blob: *.googleapis.com unpkg.com",
      "frame-src www.youtube-nocookie.com www.youtube.com",
      "connect-src 'self' *.firebaseio.com *.firebase.google.com unpkg.com cdn.jsdelivr.net storage.googleapis.com",
      "font-src 'self' fonts.gstatic.com cdn.jsdelivr.net",
      "worker-src 'self' blob: cdn.jsdelivr.net",
    ].join('; '),
  },
];

const nextConfig = {
  images: {
    formats: ['image/webp'],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
