const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
      "fs": false,
      "net": false,
      "tls": false,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url"),
      "zlib": require.resolve("browserify-zlib"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "assert": require.resolve("assert"),
      "os": require.resolve("os-browserify"),
      "path": require.resolve("path-browserify"),
      "process": require.resolve("process/browser"),
    };
    return config;
  },
};

module.exports = withNextIntl(nextConfig); 