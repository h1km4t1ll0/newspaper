/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@refinedev/antd"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;