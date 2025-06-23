import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH,
};

export default nextConfig;
