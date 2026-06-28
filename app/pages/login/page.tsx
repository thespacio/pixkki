import { PawPrint, Shield, HeartHandshake, QrCode } from 'lucide-react'
import { LoginForm } from '../../../modules/auth/components/login-form'
import Link from "next/link";

export const metadata = {
  title: 'Iniciar Sesión — Pixkki',
  description: 'Accede a tu cuenta de Pixkki',
}

const features = [
  {
    icon: Shield,
    title: 'Expedientes seguros',
    description: 'Historial clínico completo con acceso por roles.',
  },
  {
    icon: QrCode,
    title: 'ID Digital QR',
    description: 'Cada animal tiene su ficha accesible con un escaneo.',
  },
  {
    icon: HeartHandshake,
    title: 'Adopciones y donaciones',
    description: 'Gestiona el proceso completo en un solo lugar.',
  },
]

export default function LoginPage() {
  return (
      <main className="min-h-screen flex">
        {/* Left panel — branding */}
        <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-sidebar p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <PawPrint size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Pixkki
          </span>
          </div>

          <div className="space-y-10">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-sidebar-foreground text-balance">
                La plataforma integral para refugios y rescatistas animales
              </h1>
              <p className="mt-4 text-sidebar-foreground/70 leading-relaxed">
                Digitaliza y centraliza la información clínica, administrativa y
                operativa de cada animal mediante un ID Digital Único.
              </p>
            </div>

            <ul className="space-y-6">
              {features.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sidebar-foreground">{title}</p>
                      <p className="text-sm text-sidebar-foreground/60 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </li>
              ))}
            </ul>
          </div>


          <p className="text-xs text-sidebar-foreground/40">
            &copy; {new Date().getFullYear()} Pixkki. Todos los derechos reservados.
          </p>
        </aside>

        {/* Right panel — login form */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <PawPrint size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
            Pixkki
          </span>
          </div>

          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Ingresa tus credenciales para acceder al panel de gestión.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
              <LoginForm />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                  href="/src/app/auth/registro"
                  className="font-medium text-primary hover:underline"
              >
                Regístrate
              </Link>
            </p>

          </div>
        </section>
      </main>
  )
}
