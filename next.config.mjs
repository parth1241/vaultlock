/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuild: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
