import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );

                    response = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // getClaims() valida la firma del JWT de la sesión de forma local (con las claves
    // públicas del proyecto, que se guardan en memoria) y solo va a la red si el token
    // venció y hay que refrescarlo (actualizando las cookies). Antes se usaba getUser(),
    // que consulta a Supabase Auth en CADA navegación (~100 ms de espera cada vez).
    // Esto solo decide la redirección; los datos sensibles se siguen validando en el
    // servidor con getUser() (ver AuthRepository.getAuthUser).
    const { data: claimsData } = await supabase.auth.getClaims();
    const user = claimsData?.claims ?? null;

    const pathname = request.nextUrl.pathname;

    const publicRoutes = [
        "/",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/auth/callback",
        // Documentos legales públicos (US27): no requieren sesión.
        "/terminos",
        "/terminos-condiciones",
        "/aviso-privacidad",
        // Catálogo público del portal de adopciones (Épica 5).
        "/api/v1/publico",
        // API v1: endpoints públicos de auth (RF0.5)
        "/api/v1/auth/login",
        "/api/v1/auth/recover-password",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/mfa/verify",
    ];

    const authPages = [
        "/login",
        "/forgot-password",
    ];

    const isPublicAdoptionRoute =
        pathname === "/adopciones" ||
        pathname === "/adopciones/seguimiento" ||
        (pathname.startsWith("/adopciones/") &&
            !pathname.startsWith("/adopciones/solicitudes") &&
            !pathname.startsWith("/adopciones/perfiles"));

    const isPublicRefugioRoute =
        pathname === "/refugios" ||
        pathname.startsWith("/refugios/");

    const isPublicRoute =
        publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`)) ||
        isPublicAdoptionRoute ||
        isPublicRefugioRoute;

    if (!user && !isPublicRoute) {
        // Las rutas de API no redirigen a HTML: responden 401 con el
        // envelope uniforme del contrato v1 (requerimiento-00).
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "No estás autenticado.",
                        statusCode: 401,
                    },
                },
                { status: 401 }
            );
        }

        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Las Server Actions son POST a la página actual con la cabecera
    // `next-action`. Redirigirlas (p. ej. desde /login ya autenticado) rompe
    // el vínculo acción/página: Next no encuentra la acción y el cliente
    // recibe `undefined` en lugar del resultado.
    const isServerAction =
        request.method === "POST" && request.headers.has("next-action");

    if (user && !isServerAction && authPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};