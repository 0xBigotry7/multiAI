/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_PARTICLE_PROJECT_ID: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID,
    NEXT_PUBLIC_PARTICLE_CLIENT_KEY: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
    NEXT_PUBLIC_PARTICLE_APP_ID: process.env.NEXT_PUBLIC_PARTICLE_APP_ID,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };
    return config;
  },
}

module.exports = nextConfig 