import { redirect } from "next/navigation";

/**
 * El alta de refugio es un overlay sobre el listado (P-01). Esta ruta solo
 * conserva los enlaces antiguos.
 */
export default function NuevoRefugioPage() {
    redirect("/refugios?nuevo=1");
}
