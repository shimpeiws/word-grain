import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/word-grain",
  images: { unoptimized: true },
};

export default nextConfig;
