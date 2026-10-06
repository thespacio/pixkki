"use client";

import { useCallback, useEffect, useState } from "react";
import type { Factor } from "@supabase/supabase-js";

import { listFactors } from "@/modules/auth/mfa/client";

import EnableMfaCard from "./EnableMfaCard";
import { DisableMfaDialog } from "@/app/(protected)/(dashboard)/settings/security/DisableMfaDialog";

export default function SecurityPage() {
    // ✅ Tipo real en lugar de `any`
    const [factor, setFactor] = useState<Factor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const factors = await listFactors();

            // 🔍 DEBUG
            console.log(
                "🔍 [SecurityPage] factors crudos:",
                JSON.stringify(factors, null, 2)
            );

            const verified = factors.find(f => f.status === "verified");

            // 🔍 DEBUG
            console.log("🔍 [SecurityPage] verified:", {
                id: verified?.factorId,
                tipoId: typeof verified?.factorId,
                friendly_name: verified?.friendlyName,
                status: verified?.status,
            });

            // ✅ Validación defensiva: si no trae id, no lo pasamos
            if (verified && !verified.factorId) {
                console.error(
                    "❌ [SecurityPage] El factor verificado NO tiene id. Revisa listFactors().",
                    verified
                );
                setFactor(null);
                setError("Los datos del factor MFA están incompletos.");
                return;
            }


            //setFactor(verified ?? null);
        } catch (err) {
            console.error("❌ [SecurityPage] Error cargando factores:", err);
            setError(
                err instanceof Error ? err.message : "Error cargando MFA"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return <>Cargando...</>;
    }

    return (
        <main className="mx-auto max-w-2xl space-y-6">
            <h1 className="text-3xl font-semibold">Seguridad</h1>

            {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            {factor ? (
                <DisableMfaDialog factor={factor} onDisabled={load} />
            ) : (
                <EnableMfaCard onEnabled={load} />
            )}
        </main>
    );
}