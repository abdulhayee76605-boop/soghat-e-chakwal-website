import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [75, 100],
  },
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
