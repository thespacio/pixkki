'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const TYPE_OPTIONS = [
    { value: '', label: 'Todos los tipos' },
    { value: 'canil', label: 'Canil' },
    { value: 'gatera', label: 'Gatera' },
    { value: 'cuarentena', label: 'Cuarentena' },
    { value: 'rehabilitacion', label: 'Rehabilitación' },
    { value: 'otro', label: 'Otro' },
];

type Props = {
    tipo: string;
    q: string;
    soloConCupo: boolean;
};

export default function SpaceFilters({ tipo, q, soloConCupo }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(q);
    const [prevQ, setPrevQ] = useState(q);

    if (q !== prevQ) {
        setPrevQ(q);
        setSearchValue(q);
    }

    function updateParams(next: { tipo?: string; q?: string; soloConCupo?: boolean }) {
        const params = new URLSearchParams(searchParams.toString());
        const nextTipo = next.tipo ?? tipo;
        const nextQ = next.q ?? q;
        const nextSolo = next.soloConCupo ?? soloConCupo;

        if (nextTipo) params.set('tipo', nextTipo);
        else params.delete('tipo');
        if (nextQ) params.set('q', nextQ);
        else params.delete('q');
        if (nextSolo) params.set('soloConCupo', '1');
        else params.delete('soloConCupo');

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchValue !== q) updateParams({ q: searchValue });
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Buscar por nombre"
                        className="pl-9"
                        aria-label="Buscar espacio por nombre"
                    />
                </div>
                <select
                    value={tipo}
                    onChange={(e) => updateParams({ tipo: e.target.value })}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filtrar por tipo de espacio"
                >
                    {TYPE_OPTIONS.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                    type="checkbox"
                    checked={soloConCupo}
                    onChange={(e) => updateParams({ soloConCupo: e.target.checked })}
                    className="size-4 rounded border-input accent-primary"
                />
                Solo con cupo
            </label>
            {isPending && <span className="text-xs text-muted-foreground" aria-live="polite">Actualizando...</span>}
        </div>
    );
}