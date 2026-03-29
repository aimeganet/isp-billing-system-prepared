import type { NextConfig } from "next";

const isDesktopBuild = process.env.BUILD_DESKTOP === "true";

const nextConfig: NextConfig = {
  output: isDesktopBuild ? "standalone" : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb"
    }
  }
};

export default nextConfig;
