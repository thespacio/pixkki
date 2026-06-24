import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*'], // <-- Permite cualquier IP (Sí)
};

export default nextConfig;