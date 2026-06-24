import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 AÑADE ESTA LÍNEA (o varias, si necesitas más IPs)
  allowedDevOrigins: ['192.168.56.1'],
};

export default nextConfig;