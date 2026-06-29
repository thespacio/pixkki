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
    Users, BuildingIcon,
} from "lucide-react";

const navItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard/" },
    { icon: PawPrint, label: "Animales", to: "/dashboard/animals" },
    { icon: Heart, label: "Adopciones", to: "/dashboard/adoptions" },
    { icon: DollarSign, label: "Donaciones", to: "/dashboard/donations" },
    { icon: Stethoscope, label: "Expedientes", to: "/dashboard/medical" },
];

const adminItems = [
    { icon: BuildingIcon, label: "Crear Albergue", to: "/dashboard/shelter-infraestructure" },
    { icon: Users, label: "Personal", to: "/dashboard/staff" },
    { icon: BarChart2, label: "Reportes", to: "/reports" },
    { icon: FileText, label: "Documentos", to: "/documents" },
];

const logo = "/images/logo.png";
const bannerPet = "/images/banner_pet.png";

// Dentro de tu componente
import { useRouter } from "next/navigation";



export default function DashboardLayout(
    {children}: {
    children: React.ReactNode;
    }) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        // Aquí puedes agregar lógica de logout
        router.push('/auth/login');
    };

    return (
        <div
            className="flex h-screen w-full overflow-hidden bg-background"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
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

                        {/*Enlaces Main*/}
                        <p className="text-[10px] uppercase tracking-widest text-primary px-3 mb-3 font-semibold">Principal</p>
                        <ul className="space-y-0.5">
                            {navItems.map(({ icon: Icon, label, to }) => (
                                <li key={to}>

                                    <Link
                                        href={to}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                            pathname === to
                                                ? "bg-primary text-primary-foreground"
                                                : "text-gray-300 hover:text-foreground hover:bg-secondary"
                                        }`}
                                    >
                                        <Icon size={16}/>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/*Enlaces Admin*/}
                        <p className="text-[10px] uppercase tracking-widest text-primary px-3 mb-3 mt-6 font-semibold">Admin</p>
                        <ul className="space-y-0.5">
                            {adminItems.map(({ icon: Icon, label, to }) => (
                                <li key={to}>
                                    <Link
                                        href={to}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                                            pathname === to
                                                ? "bg-primary text-primary-foreground"
                                                : "text-gray-300 hover:text-foreground hover:bg-secondary"
                                        }`}
                                    >
                                        <Icon size={16}/>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
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
                            AM
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-semibold truncate">Amara Osei</p>
                            <p className="text-xs text-muted-foreground truncate">Administrador</p>
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
                        <h1 className="text-xl font-semibold text-foreground tracking-tight">Buenos días, Amara</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Wednesday, December 20, 2024 · Hillcrest Animal Shelter</p>
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
