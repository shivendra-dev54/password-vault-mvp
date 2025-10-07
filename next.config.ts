import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api` : 'http://localhost:3000/api',
  },
};

export default nextConfig;
