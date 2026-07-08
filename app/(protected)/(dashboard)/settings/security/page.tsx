"use client";

import { useCallback, useEffect, useState } from "react";

import {
    listFactors,
} from "@/modules/auth/mfa/client";

import EnableMfaCard from "./EnableMfaCard";
import {DisableMfaDialog} from "@/app/(protected)/(dashboard)/settings/security/DisableMfaDialog";


export default function SecurityPage() {

    const [factor, setFactor] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(true);

    const load = useCallback(async () => {

        setLoading(true);

        try {

            const factors =
                await listFactors();

            const verified =
                factors.find(
                    factor =>
                        factor.status ===
                        "verified"
                );

            setFactor(
                verified ?? null
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

            <h1 className="text-3xl font-semibold">

                Seguridad

            </h1>

            {

                factor

                    ?

                    <DisableMfaDialog
                        factor={factor}
                        onDisabled={load}
                    />

                    :

                    <EnableMfaCard
                        onEnabled={load}
                    />

            }

        </main>

    );

}