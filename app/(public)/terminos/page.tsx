import { redirect } from "next/navigation";

/**
 * Alias de la ruta canónica de Términos y Condiciones (US27).
 * Todo el contenido vive en `/terminos-condiciones`; esta ruta existe para
 * enlaces cortos y compatibilidad.
 */
export default function TerminosAliasPage() {
    redirect("/terminos-condiciones");
}
