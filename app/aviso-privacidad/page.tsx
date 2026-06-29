import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Política de privacidad</h1>
      <div className="prose prose-gray dark:prose-invert">
        <p>Panic</p>
      </div>
      <Link href="/modules/auth/auth.ts/login" className="inline-block mt-6 text-primary hover:underline">
        ← Volver al inicio de sesión
      </Link>
    </div>
  );
}