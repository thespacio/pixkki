"use client";

import { useCallback, useEffect, useState } from "react";

import { listFactors } from "@/modules/auth/mfa/client";

import EnableMfaCard from "./EnableMfaCard";
import { DisableMfaDialog } from "@/app/(protected)/(dashboard)/settings/security/DisableMfaDialog";

/** Forma del factor que consume DisableMfaDialog */
type MfaFactorInfo = {
    id: string;
    friendly_name: string;
};

export default function SecurityPage() {
    const [factor, setFactor] = useState<MfaFactorInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const factors = await listFactors();

            const verified = factors.find(f => f.status === "verified");

            // Validación defensiva: si no trae id, no lo pasamos
            if (verified && !verified.factorId) {
                console.error(
                    "[SecurityPage] El factor verificado NO tiene id. Revisa listFactors().",
                    verified
                );
                setFactor(null);
                setError("Los datos del factor MFA están incompletos.");
                return;
            }

            setFactor(
                verified
                    ? {
                        id: verified.factorId,
                        friendly_name: verified.friendlyName,
                    }
                    : null
            );
        } catch (err) {
            console.error("[SecurityPage] Error cargando factores:", err);
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