/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['*'], // <-- Permite cualquier IP (Sí )
  // El build excluye `tests/` (fuera del alcance del agente). El typecheck
  // completo sigue disponible con `npm run typecheck` usando tsconfig.json.
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
  /**
   * Rutas canónicas en español (F2 del plan UI/UX).
   *
   * Los redirects son 308 (permanentes) y temporales: se retiran cuando el
   * responsable de testing confirme que no quedan referencias a las rutas
   * inglesas. El orden importa: las rutas específicas van antes que las
   * comodines para evitar cadenas de redirect.
   */
  async redirects() {
    return [
      // Animales: ficha clínica antes que el comodín.
      {
        source: '/animals/:id/clinical-record',
        destination: '/animales/:id/ficha-clinica',
        permanent: true,
      },
      {
        source: '/animals',
        destination: '/animales',
        permanent: true,
      },
      {
        source: '/animals/:path*',
        destination: '/animales/:path*',
        permanent: true,
      },
      // Adopciones.
      {
        source: '/adoptions',
        destination: '/adopciones',
        permanent: true,
      },
      {
        source: '/adoptions/:path*',
        destination: '/adopciones/:path*',
        permanent: true,
      },
      // Espacios.
      {
        source: '/spaces',
        destination: '/espacios',
        permanent: true,
      },
      {
        source: '/spaces/:path*',
        destination: '/espacios/:path*',
        permanent: true,
      },
      // Refugios. El alta vive en el overlay `/refugios?nuevo=1`.
      {
        source: '/shelters/new',
        destination: '/refugios?nuevo=1',
        permanent: true,
      },
      {
        source: '/shelters',
        destination: '/refugios',
        permanent: true,
      },
      {
        source: '/shelters/:path*',
        destination: '/refugios/:path*',
        permanent: true,
      },
      // Donaciones.
      {
        source: '/donations',
        destination: '/donaciones',
        permanent: true,
      },
      {
        source: '/donations/:path*',
        destination: '/donaciones/:path*',
        permanent: true,
      },
      // Configuración.
      {
        source: '/settings/security',
        destination: '/configuracion/seguridad',
        permanent: true,
      },
      {
        source: '/settings/customize',
        destination: '/configuracion/apariencia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
