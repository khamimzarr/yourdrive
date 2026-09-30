import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { webpack, isServer }) => {
    if (!isServer) {
      // Fallback for bare (non-prefixed) Node.js modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        events: false,
        buffer: false,
        os: false,
        path: false,
        worker_threads: false,
        child_process: false,
        "timers/promises": false,
      };

      // Handle 'node:' prefixed imports by stripping the 'node:' prefix
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }
    return config;
  },
};

export default nextConfig;
