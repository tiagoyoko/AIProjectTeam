/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aiprojectteam/ui', '@aiprojectteam/shared'],
  experimental: {
    externalDir: true,
  },
  // Enable hot reloading for workspace packages
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

module.exports = nextConfig; 