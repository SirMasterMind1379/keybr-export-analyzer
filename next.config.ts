import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
};

if (process.env.STATIC_EXPORT === "true") {
  nextConfig.output = "export";
  nextConfig.basePath = basePath;
}

export default nextConfig;
