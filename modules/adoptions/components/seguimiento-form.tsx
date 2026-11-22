"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { consultarSeguimientoPorFolioAction } from "../actions/adoption.actions";

export function SeguimientoForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Record<string, unknown> | null>(null);

    return (
        <Card>
            <CardHeader><CardTitle>Consultar estado</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setError(null); setData(null);
                        const fd = new FormData(e.currentTarget);
                        const folio = String(fd.get("folio") ?? "").trim();
                        startTransition(async () => {
                            const res = await consultarSeguimientoPorFolioAction(folio);
                            if (res.success) setData(res.data as Record<string, unknown>);
                            else setError(res.error);
                        });
                    }}
                >
                    <label className="space-y-1 text-sm block">
                        <span>Folio de seguimiento</span>
                        <Input name="folio" placeholder="Ej. 3f1c2b9e-8a4d-4c1e-9f7a-2b6d5e8c1a44" required />
                    </label>
                    <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending}>
                        {isPending ? "Consultando..." : "Consultar estado"}
                    </Button>
                </form>

                {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
                {data ? (
                    <div className="rounded-xl border border-border p-4 text-sm space-y-1">
                        <p><span className="text-muted-foreground">Estado:</span> {String(data.estado_solicitud ?? "—")}</p>
                        <p><span className="text-muted-foreground">Fecha:</span> {String(data.fecha_solicitud ?? "—")}</p>
                        <p><span className="text-muted-foreground">Animal:</span> {String((data.animal as Record<string, unknown> | undefined)?.nombre ?? "—")}</p>
                        <p><span className="text-muted-foreground">Refugio:</span> {String((data.refugio as Record<string, unknown> | undefined)?.nombre ?? "—")}</p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}