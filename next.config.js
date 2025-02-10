/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    loader: 'default',
    path: '',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unavatar.io',
        pathname: '/twitter/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load sqlite3 on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sqlite3: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig