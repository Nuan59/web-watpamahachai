import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo albums and audio files go through server actions; audio may be up to 80 MB.
  experimental: { serverActions: { bodySizeLimit: "100mb" } },
  images: { localPatterns: [{ pathname: "/files/**" }, { pathname: "/*.webp" }, { pathname: "/*.png" }, { pathname: "/*.jpg" }] },
};

export default nextConfig;
