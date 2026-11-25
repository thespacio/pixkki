"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ESTADOS = [
    { value: "todos", label: "Todos los estados" },
    { value: "publicado", label: "Publicado" },
    { value: "borrador", label: "Borrador" },
    { value: "no-publicable", label: "No publicable" },
    { value: "sin-foto", label: "Sin foto" },
    { value: "sin-descripcion", label: "Sin descripción" },
] as const;

export function PerfilesFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [especie, setEspecie] = useState(searchParams.get("especie") ?? "");
    const [estado, setEstado] = useState(searchParams.get("estado") ?? "todos");

    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        const values = { q: q.trim(), especie, estado };

        for (const [key, value] of Object.entries(values)) {
            if (value && value !== "todos") params.set(key, value);
            else params.delete(key);
        }
        params.delete("page");

        const query = params.toString();
        startTransition(() => router.push(query ? `/adopciones/perfiles?${query}` : "/adopciones/perfiles"));
    }

    function clear() {
        setQ("");
        setEspecie("");
        setEstado("todos");
        startTransition(() => router.push("/adopciones/perfiles"));
    }

    const hayFiltros = q.trim() !== "" || especie !== "" || estado !== "todos";

    return (
        <form
            onSubmit={apply}
            aria-label="Filtros de perfiles de adopción"
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end"
        >
            <label htmlFor="perfiles-q" className="block space-y-1 text-sm sm:col-span-2 lg:col-span-1">
                <span className="text-muted-foreground">Buscar por nombre, raza o especie</span>
                <Input
                    id="perfiles-q"
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="Ej. Luna, labrador..."
                />
            </label>

            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Especie</span>
                <Select value={especie || "all"} onValueChange={(value) => setEspecie(value === "all" ? "" : value)}>
                    <SelectTrigger aria-label="Especie"><SelectValue placeholder="Especie" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las especies</SelectItem>
                        <SelectItem value="Perro">Perro</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Estado del perfil</span>
                <Select value={estado} onValueChange={(value) => setEstado(value)}>
                    <SelectTrigger aria-label="Estado del perfil"><SelectValue placeholder="Estado" /></SelectTrigger>
                    <SelectContent>
                        {ESTADOS.map((opcion) => (
                            <SelectItem key={opcion.value} value={opcion.value}>{opcion.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:col-span-2 lg:col-span-3 lg:justify-end">
                <Button type="submit" className="min-h-11" disabled={isPending}>
                    {isPending ? "Aplicando..." : "Aplicar filtros"}
                </Button>
                <Button type="button" variant="outline" className="min-h-11" onClick={clear} disabled={!hayFiltros || isPending}>
                    Limpiar filtros
                </Button>
            </div>
        </form>
    );
}
