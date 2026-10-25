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
    ];

    const authPages = [
        "/login",
        "/forgot-password",
    ];

    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && authPages.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};