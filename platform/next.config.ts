import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for minimal Docker images on Cloud Run
  output: "standalone",
};

export default nextConfig;
