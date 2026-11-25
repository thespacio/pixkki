import Link from "next/link";

type Props = {
    basePath: string;
    params: Record<string, string | undefined>;
    page: number;
    totalPages: number;
};

/** Paginación por enlaces: conserva los filtros y expone la página activa. */
export function CatalogPagination({ basePath, params, page, totalPages }: Props) {
    if (totalPages <= 1) return null;

    const buildHref = (nextPage: number) => {
        const search = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value) search.set(key, value);
        }
        search.set("page", String(nextPage));
        return `${basePath}?${search.toString()}`;
    };

    const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
    const lastPage = Math.min(totalPages, firstPage + 4);
    const pages = Array.from(
        { length: lastPage - firstPage + 1 },
        (_, index) => firstPage + index,
    );

    const linkClass =
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border px-3 text-sm text-foreground hover:bg-secondary";
    const disabledClass =
        "inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-3 text-sm text-muted-foreground opacity-50";

    return (
        <nav aria-label="Paginación del catálogo" className="flex justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                <li>
                    {page > 1 ? (
                        <Link href={buildHref(page - 1)} aria-label="Página anterior" className={linkClass}>
                            Anterior
                        </Link>
                    ) : (
                        <span aria-disabled="true" className={disabledClass}>Anterior</span>
                    )}
                </li>
                {pages.map((numero) => (
                    <li key={numero}>
                        <Link
                            href={buildHref(numero)}
                            aria-label={`Página ${numero}`}
                            aria-current={numero === page ? "page" : undefined}
                            className={
                                numero === page
                                    ? "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
                                    : linkClass
                            }
                        >
                            {numero}
                        </Link>
                    </li>
                ))}
                <li>
                    {page < totalPages ? (
                        <Link href={buildHref(page + 1)} aria-label="Página siguiente" className={linkClass}>
                            Siguiente
                        </Link>
                    ) : (
                        <span aria-disabled="true" className={disabledClass}>Siguiente</span>
                    )}
                </li>
            </ul>
        </nav>
    );
}
