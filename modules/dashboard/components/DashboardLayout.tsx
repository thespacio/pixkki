"use client";

import Link from "next/link";

import {usePathname} from "next/navigation";
import {
    Home,
    PawPrint,
    Heart,
    DollarSign,
    Stethoscope,
    Bell,
    Search,
    Plus,
    Settings,
    LogOut,
    BarChart2,
    FileText,
    Users, BuildingIcon, Syringe, Shield,
} from "lucide-react";

// navigation.config.ts
export const navigation = [
    // Sección Principal
    {
        icon: Home,
        title: "Dashboard",
        href: "/dashboard",
        permission: "dashboard.view",
        section: "Principal"
    },
    {
        icon: PawPrint,
        title: "Animales",
        href: "/animals",
        permission: "animals.view",
        section: "Principal"
    },
    {
        icon: Heart,
        title: "Adopciones",
        href: "/adoptions",
        permission: "adoptions.view",
        section: "Principal"
    },

    // Sección Administración (solo admin/superadmin)
    {
        icon: Users,
        title: "Usuarios",
        href: "/staff",
        permission: "users.view",
        section: "Administración"
    },
    {
        icon: BuildingIcon,
        title: "Albergues",
        href: "/shelters",
        permission: "shelter.view",
        section: "Administración"
    },
    {
        icon: BuildingIcon,
        title: "Espacios",
        href: "/shelter-spaces",
        permission: "spaces.view",
        section: "Administración"
    },
    {
        icon: BarChart2,
        title: "Reportes",
        href: "/reports",
        permission: "reports.view",
        section: "Administración"
    },

    // Sección Veterinaria (solo veterinario)
    {
        icon: Stethoscope,
        title: "Expedientes",
        href: "/medical",
        permission: "medical.view",
        section: "Veterinaria"
    },
    {
        icon: Syringe,
        title: "Vacunaciones",
        href: "/vaccinations",
        permission: "vaccinations.view",
        section: "Veterinaria"
    },

    // Sección Configuración (solo superadmin)
    {
        icon: Settings,
        title: "Configuración",
        href: "/settings",
        permission: "settings.view",
        section: "Configuración"
    },
    {
        icon: Shield,
        title: "Seguridad",
        href: "/settings/security",
        permission: "security.view",
        section: "Configuración"
    }
];

const logo = "/images/logo.png";
const bannerPet = "/images/banner_pet.png";

// Dentro de tu componente
import { useRouter } from "next/navigation";
import {logout} from "@/modules/auth/client";
import {hasPermission} from "@/modules/auth/authorization";
import {useAuth} from "@/components/layouts/AuthProvider";

export default function DashboardLayout(
    {children}: {
        children: React.ReactNode;
    }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const userInitials = user?.fullName
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    console.log(user);

    if (loading || !user) {
        return null;
    }

    // Filtrar items por permisos
    const filteredNavItems = navigation.filter(item =>
        hasPermission(user, item.permission)
    );

    // Agrupar por sección
    const groupedNavItems = filteredNavItems.reduce(
        (acc,
         item) => {
        const section = item.section || "Principal";
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(item);
        return acc;
    }, {} as Record<string, typeof navigation>);

    async function handleLogout() {
        try {
            await logout();

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div
            className="flex h-screen w-full overflow-hidden bg-background"
        >
            {/* Contenedor Aside */}
            <div className={"relative"}>
                {/*Fondo*/}
                <div
                    className="absolute inset-0 opacity-2 pointer-events-none"
                    style={{
                        backgroundImage: "url('/images/banner_pet.jpg')",
                        backgroundRepeat: "repeat",
                        backgroundSize: "600px",
                    }}>
                </div>
                {/* Sidebar */}
                <aside
                    className="w-[240px] flex-shrink-0 bg-foreground border-r border-border flex flex-col h-full"
                >
                    {/* Logo */}
                    <div className="px-6 py-6 border-b flex items-center gap-3">
                        <div className="w-9 h-9 px-1 py-1 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#43AE6D" }}>
                            <img src={logo} alt="Logo" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-white max-w-3/4">Albergue Zorro Tobias</span>
                    </div>
                    {/* Nav */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">

                        {/*Enlaces */}
                        <div className="flex-1 overflow-y-auto">
                            {Object.entries(groupedNavItems).map(([section, items]) => (
                                <div key={section} className="mb-6">
                                    {/* Título de sección */}
                                    <p className="text-[10px] uppercase tracking-widest text-primary px-3 mb-3 font-semibold">
                                        {section}
                                    </p>

                                    {/* Items de la sección */}
                                    <ul className="space-y-0.5">
                                        {items.map(({ icon: Icon, title, href }) => (
                                            <li key={href}>
                                                <Link
                                                    href={href}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                                        pathname === href || pathname.startsWith(href + '/')
                                                            ? "bg-primary text-primary-foreground"
                                                            : "text-gray-300 hover:text-foreground hover:bg-secondary"
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    {title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                    </nav>
                    {/* Mensaje Shelter */}
                    <div className="px-3 pb-4">
                        <div className="rounded-2xl p-4 bg-green-50 hidden" >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-xs font-semibold" style={{ color: "#43AE6D" }}>Shelter Open</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                147 animals currently in care. Capacity at 78%.
                            </p>
                        </div>
                    </div>
                    {/* Perfil */}
                    <div className="px-4 py-4 border-t border-border flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: "#43AE6D" }}>
                            {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-semibold truncate">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="relative group cursor-pointer p-2 rounded-md hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            title="Cerrar sesión"
                        >
                            <LogOut
                                size={18}
                                className="text-muted-foreground group-hover:text-red-600 transition-colors duration-200"
                            />
                            <span className="sr-only">Cerrar sesión</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/*Header*/}
                <header
                    className="border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0"
                >
                    <div>
                        <h1 className="text-xl font-semibold text-foreground tracking-tight">Buenos días, {user.fullName}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }).replace(/^\w/, c => c.toUpperCase())}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={23} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar animales, reportes..."
                                className="pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-60 placeholder:text-muted-foreground"
                            />
                        </div>
                        <button className="relative p-2.5 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
                            <Bell size={16} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90"
                            style={{ backgroundColor: "#43AE6D" }}
                        >
                            <Plus size={14} />
                            Añadir Animal
                        </button>
                    </div>
                </header>
                {/*Contenedor Principal*/}
                <main className="flex-1 overflow-y-auto bg-background opacity-100">
                    {children}
                </main>
            </div>
        </div>
    );
}