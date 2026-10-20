import { NextResponse } from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server-client";

export async function POST() {

    try {

        // El route handler corre en el servidor: se usa el cliente
        // de servidor para que el cierre de sesión invalide y limpie
        // las cookies de sesión (F-AUTH-06).
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: "No fue posible cerrar la sesión.",
            },
            {
                status: 500,
            }
        );

    }

}