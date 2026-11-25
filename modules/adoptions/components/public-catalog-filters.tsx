"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RefugioOption = { slug: string; nombre: string };

type Props = {
    basePath?: string;
    refugios?: RefugioOption[];
    refugiosDisponibles?: boolean;
    showRefugioFilter?: boolean;
};

type FilterValues = {
    q: string;
    refugio: string;
    especie: string;
    sexo: string;
    tamano: string;
    edadMin: string;
    edadMax: string;
    temperamento: string;
    orden: string;
};

const EMPTY_VALUES: FilterValues = {
    q: "",
    refugio: "",
    especie: "",
    sexo: "",
    tamano: "",
    edadMin: "",
    edadMax: "",
    temperamento: "",
    orden: "",
};

const KEYS: Array<keyof FilterValues> = [
    "q",
    "refugio",
    "especie",
    "sexo",
    "tamano",
    "edadMin",
    "edadMax",
    "temperamento",
    "orden",
];

const ORDENES = [
    { value: "recientes", label: "Más recientes" },
    { value: "antiguos", label: "Más antiguos" },
    { value: "edad_asc", label: "Menor edad primero" },
    { value: "edad_desc", label: "Mayor edad primero" },
];

export function PublicCatalogFilters({
    basePath = "/adopciones",
    refugios = [],
    refugiosDisponibles = true,
    showRefugioFilter = true,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [values, setValues] = useState<FilterValues>(() => ({
        q: searchParams.get("q") ?? "",
        refugio: searchParams.get("refugio") ?? "",
        especie: searchParams.get("especie") ?? "",
        sexo: searchParams.get("sexo") ?? "",
        tamano: searchParams.get("tamano") ?? "",
        edadMin: searchParams.get("edadMin") ?? "",
        edadMax: searchParams.get("edadMax") ?? "",
        temperamento: searchParams.get("temperamento") ?? "",
        orden: searchParams.get("orden") ?? "",
    }));

    function setField(key: keyof FilterValues, value: string) {
        setValues((prev) => ({ ...prev, [key]: value }));
    }

    function apply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const search = new URLSearchParams(searchParams.toString());
        for (const key of KEYS) {
            const value = values[key].trim();
            if (value) search.set(key, value);
            else search.delete(key);
        }
        search.delete("page");
        const query = search.toString();
        startTransition(() => router.push(query ? `${basePath}?${query}` : basePath));
    }

    function clear() {
        setValues(EMPTY_VALUES);
        startTransition(() => router.push(basePath));
    }

    const hasFilters = KEYS.some((key) => values[key].trim() !== "");
    const especies = Array.from(new Set(["Perro", "Gato", values.especie].filter(Boolean)));

    return (
        <form
            onSubmit={apply}
            aria-label="Filtros del catálogo"
            className="space-y-4 rounded-2xl border border-border bg-card p-4"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <label htmlFor="filtro-q" className="block space-y-1 text-sm sm:col-span-2 xl:col-span-2">
                    <span className="text-muted-foreground">Buscar por nombre, raza o descripción</span>
                    <Input
                        id="filtro-q"
                        value={values.q}
                        onChange={(event) => setField("q", event.target.value)}
                        placeholder="Ej. Luna, labrador..."
                    />
                </label>

                {showRefugioFilter && (refugiosDisponibles ? (
                    <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Refugio</span>
                        <Select value={values.refugio || "all"} onValueChange={(value) => setField("refugio", value === "all" ? "" : value)}>
                            <SelectTrigger aria-label="Refugio">
                                <SelectValue placeholder="Todos los refugios" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los refugios</SelectItem>
                                {refugios.map((refugio) => (
                                    <SelectItem key={refugio.slug} value={refugio.slug}>{refugio.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <p className="self-end text-xs text-muted-foreground">
                        No pudimos cargar los refugios. Puedes buscar por nombre.
                    </p>
                ))}

                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Especie</span>
                    <Select value={values.especie || "all"} onValueChange={(value) => setField("especie", value === "all" ? "" : value)}>
                        <SelectTrigger aria-label="Especie"><SelectValue placeholder="Especie" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las especies</SelectItem>
                            {especies.map((especie) => (
                                <SelectItem key={especie} value={especie}>{especie}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Sexo</span>
                    <Select value={values.sexo || "all"} onValueChange={(value) => setField("sexo", value === "all" ? "" : value)}>
                        <SelectTrigger aria-label="Sexo"><SelectValue placeholder="Sexo" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Cualquier sexo</SelectItem>
                            <SelectItem value="M">Macho</SelectItem>
                            <SelectItem value="H">Hembra</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Tamaño</span>
                    <Select value={values.tamano || "all"} onValueChange={(value) => setField("tamano", value === "all" ? "" : value)}>
                        <SelectTrigger aria-label="Tamaño"><SelectValue placeholder="Tamaño" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Cualquier tamaño</SelectItem>
                            <SelectItem value="Pequeño">Pequeño</SelectItem>
                            <SelectItem value="Mediano">Mediano</SelectItem>
                            <SelectItem value="Grande">Grande</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <label htmlFor="filtro-edad-min" className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">Edad mínima (años)</span>
                    <Input
                        id="filtro-edad-min"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={values.edadMin}
                        onChange={(event) => setField("edadMin", event.target.value)}
                    />
                </label>

                <label htmlFor="filtro-edad-max" className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">Edad máxima (años)</span>
                    <Input
                        id="filtro-edad-max"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={values.edadMax}
                        onChange={(event) => setField("edadMax", event.target.value)}
                    />
                </label>

                <label htmlFor="filtro-temperamento" className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">Temperamento</span>
                    <Input
                        id="filtro-temperamento"
                        value={values.temperamento}
                        onChange={(event) => setField("temperamento", event.target.value)}
                        placeholder="Ej. Sociable"
                    />
                </label>

                <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Ordenar por</span>
                    <Select value={values.orden || "all"} onValueChange={(value) => setField("orden", value === "all" ? "" : value)}>
                        <SelectTrigger aria-label="Ordenar por"><SelectValue placeholder="Más recientes" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Predeterminado</SelectItem>
                            {ORDENES.map((orden) => (
                                <SelectItem key={orden.value} value={orden.value}>{orden.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="submit" className="min-h-11 w-full sm:w-auto" disabled={isPending}>
                    {isPending ? "Aplicando..." : "Aplicar filtros"}
                </Button>
                <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" onClick={clear} disabled={!hasFilters || isPending}>
                    Limpiar filtros
                </Button>
                {isPending && <span className="text-xs text-muted-foreground">Actualizando resultados...</span>}
            </div>
        </form>
    );
}
