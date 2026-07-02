    'use client'

    import Link from 'next/link'
    import { usePathname, useRouter } from 'next/navigation'
    import {
    Home, PawPrint, Heart, DollarSign, Stethoscope,
    Bell, Search, Plus, LogOut, BarChart2, FileText,
    Users, Building2, Store,
    } from 'lucide-react'
    import { useUserRole } from '../../auth/hooks/useUserRole'
    import { UserRole } from '../../auth/services/authService'
    import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'
    import { useEffect, useState } from 'react'

    type NavItem = {
    icon: React.ElementType
    label: string
    to: string
    roles: UserRole[]
    }

    const ALL_ROLES: UserRole[] = ['Administrador', 'Veterinario', 'Voluntario', 'Recepcionista']

    const NAV_ITEMS: NavItem[] = [
    { icon: Home,        label: 'Dashboard',    to: '/dashboard',              roles: ['Administrador'] },
    { icon: PawPrint,   label: 'Animales',     to: '/dashboard/animals',      roles: ['Administrador', 'Veterinario', 'Voluntario'] },
    { icon: Heart,      label: 'Adopciones',   to: '/dashboard/adoptions',    roles: ALL_ROLES },
    { icon: DollarSign, label: 'Donaciones',   to: '/dashboard/donations',    roles: ['Administrador', 'Recepcionista'] },
    { icon: Stethoscope,label: 'Expedientes',  to: '/dashboard/medical',      roles: ['Administrador', 'Veterinario'] },
    { icon: Store,      label: 'Mi albergue',  to: '/dashboard/mi-albergue',  roles: ['Administrador'] },
    ]

    const ADMIN_ITEMS: NavItem[] = [
    { icon: Building2,  label: 'Espacios',     to: '/dashboard/shelter-spaces', roles: ['Administrador'] },
    { icon: Users,      label: 'Personal',     to: '/dashboard/staff',          roles: ['Administrador'] },
    { icon: BarChart2,  label: 'Reportes',     to: '/reports',                  roles: ['Administrador'] },
    { icon: FileText,   label: 'Documentos',   to: '/documents',                roles: ['Administrador'] },
    ]

    const logo = '/images/logo.png'

    export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname  = usePathname()
    const router    = useRouter()
    const supabase  = getSupabaseBrowserClient()
    const { role, loading } = useUserRole()

    const [userName, setUserName]       = useState('Usuario')
    const [userInitials, setUserInitials] = useState('U')

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user?.email) return
        supabase
            .from('usuario')
            .select('nombre_completo')
            .eq('correo', user.email)
            .single()
            .then(({ data }) => {
            if (data?.nombre_completo) {
                setUserName(data.nombre_completo)
                const parts = data.nombre_completo.trim().split(' ')
                setUserInitials(
                parts.length >= 2
                    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                    : parts[0].slice(0, 2).toUpperCase()
                )
            }
            })
        })
    }, [supabase])

    const visibleNav   = role ? NAV_ITEMS.filter((i)   => i.roles.includes(role)) : []
    const visibleAdmin = role ? ADMIN_ITEMS.filter((i) => i.roles.includes(role)) : []

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    if (loading) {
        return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        )
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background"
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>

        {/* Sidebar */}
        <aside className="w-[240px] flex-shrink-0 bg-foreground border-r border-border flex flex-col h-full">

            {/* Logo */}
            <div className="px-6 py-6 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 px-1 py-1 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#43AE6D' }}>
                <img src={logo} alt="Logo" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
                Albergue Zorro Tobias
            </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {visibleNav.length > 0 && (
                <>
                <p className="text-[10px] uppercase tracking-widest text-primary px-3 mb-3 font-semibold">
                    Principal
                </p>
                <ul className="space-y-0.5">
                    {visibleNav.map(({ icon: Icon, label, to }) => (
                    <li key={to}>
                        <Link href={to} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        pathname === to
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-300 hover:text-foreground hover:bg-secondary'
                        }`}>
                        <Icon size={16} />{label}
                        </Link>
                    </li>
                    ))}
                </ul>
                </>
            )}

            {visibleAdmin.length > 0 && (
                <>
                <p className="text-[10px] uppercase tracking-widest text-primary px-3 mb-3 mt-6 font-semibold">
                    Admin
                </p>
                <ul className="space-y-0.5">
                    {visibleAdmin.map(({ icon: Icon, label, to }) => (
                    <li key={to}>
                        <Link href={to} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        pathname === to
                            ? 'bg-primary text-primary-foreground'
                            : 'text-gray-300 hover:text-foreground hover:bg-secondary'
                        }`}>
                        <Icon size={16} />{label}
                        </Link>
                    </li>
                    ))}
                </ul>
                </>
            )}
            </nav>

            {/* Perfil */}
            <div className="px-4 py-4 border-t border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                style={{ backgroundColor: '#43AE6D' }}>
                {userInitials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-semibold truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{role ?? '—'}</p>
            </div>
            <button
                onClick={handleLogout}
                className="group cursor-pointer p-2 rounded-md hover:bg-red-50 transition-all duration-200"
                title="Cerrar sesión"
            >
                <LogOut size={18} className="text-muted-foreground group-hover:text-red-600 transition-colors duration-200" />
            </button>
            </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
            <div>
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                Bienvenido, {userName.split(' ')[0]}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('es-MX', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Buscar animales, reportes..."
                    className="pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-60 placeholder:text-muted-foreground" />
                </div>
                <button className="relative p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                </button>
                {role && ['Administrador', 'Veterinario'].includes(role) && (
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: '#43AE6D' }}
                >
                    <Plus size={14} />Añadir Animal
                </button>
                )}
            </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
        </div>
    )
    }