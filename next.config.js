/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*'], // <-- Permite cualquier IP (Sí )
  // El build excluye `tests/` (fuera del alcance del agente). El typecheck
  // completo sigue disponible con `npm run typecheck` usando tsconfig.json.
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
};

export default nextConfig;
