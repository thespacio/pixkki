"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PublicCatalogFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function update(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") params.set(key, value);
        else params.delete(key);
        params.delete("page");
        startTransition(() => {
            router.push(`/adopciones?${params.toString()}`);
        });
    }

    function clear() {
        startTransition(() => router.push("/adopciones"));
    }

    const hasFilters = ["refugio", "especie", "sexo", "tamano", "temperamento", "q"].some(
        (k) => searchParams.get(k),
    );

    return (
        <div className="rounded-2xl border border-border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <Input
                    defaultValue={searchParams.get("q") ?? ""}
                    placeholder="Buscar por nombre..."
                    aria-label="Buscar animal"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
                    }}
                    onBlur={(e) => update("q", e.target.value)}
                />
                <Select value={searchParams.get("especie") ?? "all"} onValueChange={(v) => update("especie", v)}>
                    <SelectTrigger aria-label="Especie"><SelectValue placeholder="Especie" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las especies</SelectItem>
                        <SelectItem value="Perro">Perro</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={searchParams.get("sexo") ?? "all"} onValueChange={(v) => update("sexo", v)}>
                    <SelectTrigger aria-label="Sexo"><SelectValue placeholder="Sexo" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquier sexo</SelectItem>
                        <SelectItem value="M">Macho</SelectItem>
                        <SelectItem value="H">Hembra</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={searchParams.get("tamano") ?? "all"} onValueChange={(v) => update("tamano", v)}>
                    <SelectTrigger aria-label="Tamaño"><SelectValue placeholder="Tamaño" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquier tamaño</SelectItem>
                        <SelectItem value="Pequeño">Pequeño</SelectItem>
                        <SelectItem value="Mediano">Mediano</SelectItem>
                        <SelectItem value="Grande">Grande</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    defaultValue={searchParams.get("temperamento") ?? ""}
                    placeholder="Temperamento"
                    aria-label="Temperamento"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") update("temperamento", (e.target as HTMLInputElement).value);
                    }}
                    onBlur={(e) => update("temperamento", e.target.value)}
                />
                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={clear} disabled={!hasFilters || isPending}>
                        Limpiar filtros
                    </Button>
                </div>
            </div>
            {isPending && <p className="mt-2 text-xs text-muted-foreground">Actualizando resultados...</p>}
        </div>
    );
}