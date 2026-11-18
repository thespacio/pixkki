import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/modules/auth";

export const metadata: Metadata = {
    title: "Mi cuenta",
    description: "Datos de tu cuenta y acceso.",
};

const ROLE_LABEL: Record<string, string> = {
    admin: "Administrador",
    veterinario: "Veterinario",
    superadmin: "Superadministrador",
};

/**
 * Datos de la cuenta en sesión. Es solo lectura: la edición del perfil no está
 * en el alcance del Requerimiento 00 y la contraseña se cambia en su propia
 * pantalla.
 */
export default async function CuentaPage() {
    const user = await getCurrentUser();

    const rows = [
        { label: "Nombre completo", value: user.fullName },
        { label: "Correo electrónico", value: user.email },
        {
            label: "Rol",
            value: ROLE_LABEL[user.role] ?? user.role,
        },
    ];

    return (
        <div className="mx-auto max-w-2xl p-6 md:p-8">
            <PageHeader
                title="Mi cuenta"
                description="Información de la cuenta con la que has iniciado sesión."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Datos de la cuenta</CardTitle>
                    <CardDescription>
                        Para modificar tu nombre o correo, contacta al
                        administrador de tu refugio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="divide-y divide-border">
                        {rows.map((row) => (
                            <div
                                key={row.label}
                                className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <dt className="text-sm text-muted-foreground">
                                    {row.label}
                                </dt>
                                <dd className="text-sm font-medium text-foreground">
                                    {row.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Contraseña</CardTitle>
                    <CardDescription>
                        Cambia tu contraseña de acceso a Pixkki.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline">
                        <Link href="/change-password">
                            <KeyRound aria-hidden="true" />
                            Cambiar contraseña
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
