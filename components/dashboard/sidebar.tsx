'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PawPrint,
  LayoutDashboard,
  Stethoscope,
  HeartHandshake,
  Gift,
  Users,
  QrCode,
  Package,
  Bell,
  BarChart3,
  LogOut,
  ChevronRight,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {getSupabaseBrowserClient} from "@/lib/supabase/browser-client";

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/animales', label: 'Animales', icon: PawPrint },
  { href: '/dashboard/clinico', label: 'Expediente Clínico', icon: Stethoscope },
  { href: '/dashboard/adopciones', label: 'Adopciones', icon: HeartHandshake },
  { href: '/dashboard/donaciones', label: 'Donaciones', icon: Gift },
  { href: '/dashboard/voluntarios', label: 'Voluntarios', icon: Users },
  { href: '/dashboard/qr', label: 'Lector QR', icon: QrCode },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Package },
  { href: '/dashboard/alertas', label: 'Alertas', icon: Bell },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <PawPrint size={16} className="text-primary-foreground" />
        </div>
        <div>
          <span className="text-base font-bold text-sidebar-foreground">Pixkki</span>
          <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">
            Panel de gestión
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Navegación principal">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="opacity-60" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
