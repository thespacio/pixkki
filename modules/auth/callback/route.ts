import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const supabase = await createSupabaseServerClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData.user?.email) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { data: usuarioData } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("correo", sessionData.user.email)
    .eq("activo", true)
    .single();

  if (!usuarioData) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const { data: rolData } = await supabase
    .from("usuario_rol")
    .select("rol(nombre_rol)")
    .eq("id_usuario", usuarioData.id_usuario)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nombreRol: string | undefined = (rolData as any)?.rol?.nombre_rol;

  const ROLE_REDIRECT: Record<string, string> = {
    Administrador: "/dashboard",
    Veterinario: "/dashboard/animals",
    Voluntario: "/dashboard/adoptions",
    Recepcionista: "/dashboard/adoptions",
  };

  const redirectTo = nombreRol
    ? (ROLE_REDIRECT[nombreRol] ?? "/dashboard")
    : "/dashboard";

  return NextResponse.redirect(new URL(redirectTo, request.url));
}