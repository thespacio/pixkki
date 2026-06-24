import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*'], // <-- Permite cualquier IP
};

export default nextConfig;