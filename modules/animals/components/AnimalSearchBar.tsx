"use client";

import { Search } from "lucide-react";

type Props = {
    value: string;
    onChange: (v: string) => void;
};

export function AnimalSearchBar({ value, onChange }: Props) {
    return (
        <div className="relative mb-6">
            <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Buscar por nombre, especie o raza..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
        </div>
    );
}