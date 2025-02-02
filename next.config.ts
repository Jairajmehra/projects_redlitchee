import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 120,
  images: {
    domains: [
      'test-vision-api-389008.el.r.appspot.com',
      'storage.googleapis.com'
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://projects.redlitchee.com',
  },
};

export default nextConfig;
