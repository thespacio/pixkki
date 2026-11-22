"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ESTADOS = ["Recibida", "En entrevista", "En evaluación", "Aprobada", "Rechazada", "Cancelada", "Completada"];

export function SolicitudesFilters() {
    const router = useRouter();
    const sp = useSearchParams();

    function setParam(key: string, value: string) {
        const params = new URLSearchParams(sp.toString());
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        params.delete("page");
        router.push(`/adopciones/solicitudes?${params.toString()}`);
    }

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
            <Input
                defaultValue={sp.get("q") ?? ""}
                placeholder="Buscar por folio, adoptante o animal"
                className="sm:max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && setParam("q", e.currentTarget.value)}
                onBlur={(e) => setParam("q", e.currentTarget.value)}
            />
            <Select value={sp.get("estado") ?? "all"} onValueChange={(v) => setParam("estado", v)}>
                <SelectTrigger className="sm:w-52"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {ESTADOS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => router.push("/adopciones/solicitudes")}>Limpiar</Button>
        </div>
    );
}