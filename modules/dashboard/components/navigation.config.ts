// navigation.config.ts
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
        title: "Personal",
        href: "/staff",
        permission: "users.view",
        section: "Principal"
    },
    {
        icon: Users,
        title: "Usuarios globales",
        href: "/users",
        permission: "users.global.view",
        section: "Principal"
    },
    {
        icon: BuildingIcon,
        title: "Albergues",
        href: "/shelters",
        permission: "shelter.view",
        section: "Principal"
    },
    {
        icon: BuildingIcon,
        title: "Espacios",
        href: "/spaces",
        permission: "spaces.view",
        section: "Principal"
    },
    {
        icon: BarChart2,
        title: "Reportes",
        href: "/reports",
        permission: "reports.view",
        section: "Principal"
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