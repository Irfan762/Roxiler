/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from common domains if needed
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
