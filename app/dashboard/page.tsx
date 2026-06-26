import { KpiCard } from '../components/dashboard/kpi-card'
import {
  PawPrint,
  HeartHandshake,
  Gift,
  Users,
  Stethoscope,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export const metadata = {
  title: 'Dashboard — Pixkki',
}

const kpis = [
  {
    title: 'Animales en refugio',
    value: 84,
    description: '12 llegaron este mes',
    icon: PawPrint,
    trend: { value: '14%', positive: true },
    accent: 'primary' as const,
  },
  {
    title: 'Adopciones este mes',
    value: 17,
    description: 'Tasa del 20% este periodo',
    icon: HeartHandshake,
    trend: { value: '8%', positive: true },
    accent: 'secondary' as const,
  },
  {
    title: 'Donaciones recibidas',
    value: '$24,500',
    description: 'Monetarias y en especie',
    icon: Gift,
    trend: { value: '5%', positive: false },
    accent: 'accent' as const,
  },
  {
    title: 'Voluntarios activos',
    value: 38,
    description: '6 nuevos registros',
    icon: Users,
    trend: { value: '18%', positive: true },
    accent: 'primary' as const,
  },
  {
    title: 'En tratamiento médico',
    value: 11,
    description: 'Requieren atención urgente',
    icon: Stethoscope,
    trend: { value: '2%', positive: false },
    accent: 'destructive' as const,
  },
  {
    title: 'Días promedio de estancia',
    value: '42 días',
    description: 'Meta: 30 días',
    icon: Clock,
    accent: 'accent' as const,
  },
  {
    title: 'Alertas pendientes',
    value: 7,
    description: 'Vacunas y tratamientos',
    icon: AlertTriangle,
    accent: 'destructive' as const,
  },
  {
    title: 'Tasa de recuperación',
    value: '91%',
    description: 'Últimos 90 días',
    icon: TrendingUp,
    trend: { value: '3%', positive: true },
    accent: 'secondary' as const,
  },
]

const recentAnimals = [
  { id: 'PKK-001', name: 'Luna', species: 'Perro', status: 'Disponible', date: '2024-05-28' },
  { id: 'PKK-002', name: 'Milo', species: 'Gato', status: 'En tratamiento', date: '2024-06-01' },
  { id: 'PKK-003', name: 'Bella', species: 'Perro', status: 'En observación', date: '2024-06-03' },
  { id: 'PKK-004', name: 'Max', species: 'Conejo', status: 'Disponible', date: '2024-06-04' },
  { id: 'PKK-005', name: 'Cleo', species: 'Gato', status: 'Adoptado', date: '2024-06-05' },
]

const statusColors: Record<string, string> = {
  'Disponible': 'bg-secondary/15 text-secondary',
  'En tratamiento': 'bg-destructive/15 text-destructive',
  'En observación': 'bg-accent/20 text-accent-foreground',
  'Adoptado': 'bg-primary/15 text-primary',
  'Rescatado': 'bg-muted text-muted-foreground',
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          {greeting}, {user?.email?.split('@')[0] ?? 'usuario'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aquí tienes un resumen del estado actual del refugio.
        </p>
      </div>

      {/* KPI grid */}
      <section aria-label="Indicadores clave">
        <h2 className="sr-only">Indicadores clave de rendimiento</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </section>

      {/* Recent animals table */}
      <section aria-label="Animales recientes">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Ingresos recientes
            </h2>
            <a
              href="/dashboard/animales"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todos
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Especie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha ingreso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentAnimals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {animal.id}
                    </td>
                    <td className="px-6 py-3 font-medium text-foreground">
                      {animal.name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {animal.species}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[animal.status] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {animal.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {animal.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
