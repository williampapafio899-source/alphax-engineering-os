import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores the stray package-lock.json
  // at C:\Users\scrut\ and only watches this project
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Webpack fallback (used when running --webpack explicitly)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
