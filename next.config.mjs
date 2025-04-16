/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Remove asset prefix entirely to avoid proxy issues
  // assetPrefix: undefined,
  // Add base path if needed (usually not needed unless app is not at root)
  // basePath: process.env.NODE_ENV === 'production' ? '' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'reader.dg5.com.br'],
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'canvas'],
  },
  webpack: (config) => {
    // SVGR config
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    
    // Handle canvas binary module
    config.resolve.alias.canvas = false;
    
    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
          // Add cache control headers to prevent caching API responses
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig; 