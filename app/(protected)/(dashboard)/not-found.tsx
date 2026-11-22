import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Página no encontrada dentro del área autenticada. Se usa cuando una vista
 * llama a `notFound()` (por ejemplo, un animal o refugio inexistente).
 */
export default function DashboardNotFound() {
    return (
        <div className="mx-auto max-w-2xl text-center">
            <SearchX
                aria-hidden="true"
                className="mx-auto mb-3 size-10 text-muted-foreground/60"
            />
            <h1 className="text-xl font-semibold text-foreground">
                No encontramos esta página
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Puede que el enlace esté roto o que el registro ya no exista.
            </p>
            <Button asChild size="lg" className="mt-6">
                <Link href="/dashboard">Volver al panel</Link>
            </Button>
        </div>
    );
}
