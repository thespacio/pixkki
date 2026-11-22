"use client";

import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { listFactors } from "@/modules/auth/mfa/client";
import type { TotpFactor } from "@/modules/auth/types";

import { DisableMfaDialog } from "./DisableMfaDialog";
import EnableMfaCard from "./EnableMfaCard";

export default function SecurityPage() {
    const [factor, setFactor] = useState<TotpFactor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const factors = await listFactors();
            const verified = factors.find((item) => item.status === "verified") ?? null;
            setFactor(verified);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo cargar la configuración de seguridad."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const factors = await listFactors();
                const verified =
                    factors.find((item) => item.status === "verified") ?? null;
                if (active) setFactor(verified);
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "No se pudo cargar la configuración de seguridad."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    return (
        <section className="mx-auto max-w-2xl space-y-6" aria-labelledby="security-title">
            <div className="space-y-1">
                <h1 id="security-title" className="text-xl font-semibold text-foreground">
                    Seguridad
                </h1>
                <p className="text-sm text-muted-foreground">
                    Administra la autenticación de dos pasos de tu cuenta.
                </p>
            </div>

            {error ? (
                <Alert variant="destructive" role="alert">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            {loading ? (
                <Card>
                    <CardContent className="space-y-3 p-6">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-full max-w-md" />
                        <Skeleton className="h-10 w-40" />
                    </CardContent>
                </Card>
            ) : factor ? (
                <DisableMfaDialog factor={factor} onDisabled={load} />
            ) : (
                <EnableMfaCard onEnabled={load} />
            )}
        </section>
    );
}
