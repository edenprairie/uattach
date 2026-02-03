import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    // @ts-expect-error - This is required to satisfy Vercel's build process despite not being in the type definition
    turbopack: {},
  }
};

export default nextConfig;
