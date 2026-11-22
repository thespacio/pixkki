import type { ReactNode } from "react";
import Link from "next/link";

interface PublicShellProps {
    children: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <a
                href="#contenido-publico"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
            >
                Saltar al contenido
            </a>
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                            P
                        </span>
                        <span className="text-lg tracking-tight">Pixkki</span>
                    </Link>
                    <nav aria-label="Navegación pública" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <Link href="/adopciones" className="hover:text-foreground transition-colors">Adopciones</Link>
                        <Link href="/refugios" className="hover:text-foreground transition-colors">Refugios</Link>
                        <Link href="/adopciones/seguimiento" className="hover:text-foreground transition-colors">Seguimiento</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                        >
                            Iniciar sesión
                        </Link>
                        <Link
                            href="/adopciones"
                            className="hidden min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity sm:inline-flex"
                        >
                            Ver adopciones
                        </Link>
                    </div>
                </div>
            </header>
            <main id="contenido-publico" tabIndex={-1} className="focus:outline-none">
                {children}
            </main>
            <footer className="border-t border-border bg-card">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <p>© {new Date().getFullYear()} Pixkki. Albergando huellas.</p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/aviso-privacidad" className="hover:text-foreground transition-colors">Aviso de privacidad</Link>
                        <Link href="/terminos-condiciones" className="hover:text-foreground transition-colors">Términos</Link>
                        <Link href="/adopciones/seguimiento" className="hover:text-foreground transition-colors">Seguimiento</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}