// middleware.ts (en la raíz del proyecto)
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    console.log('🔵 Middleware ejecutándose para:', request.nextUrl.pathname);

    let response = NextResponse.next({
        request,
    });

    // Crear cliente de Supabase
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

    // Obtener usuario y sesión
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('👤 Usuario autenticado:', user?.email || 'No autenticado');

    const path = request.nextUrl.pathname;
    const isAuthPath = path === '/login' || path === '/register';
    const isProtectedPath = !isAuthPath && path !== '/';

    // Si el usuario está autenticado y está en login/register, redirigir al dashboard
    if (user && isAuthPath) {
        console.log('🔄 Usuario autenticado redirigido de', path, 'a /dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si el usuario NO está autenticado y está en una ruta protegida, redirigir a login
    if (!user && isProtectedPath) {
        console.log('🔒 Usuario no autenticado intentando acceder a:', path);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si el usuario NO está autenticado y está en /, redirigir a login
    /*if (!user && path === '/') {
        console.log('🏠 Usuario no autenticado en home, redirigiendo a login');
        return NextResponse.redirect(new URL('/login', request.url));
    }*/

    console.log('✅ Acceso permitido a:', path);
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, jpg, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};