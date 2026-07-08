    import { NextResponse } from 'next/server'
    import { createClient } from '@supabase/supabase-js'
    import { createSupabaseServerClient } from '@/lib/supabase/server-client'

    const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
    )

    export async function POST(request: Request) {
    // Solo el super admin puede hacer esto
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== 'pixkki@pixkki.es') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { correo, nueva_password } = await request.json()

    if (!correo || !nueva_password || nueva_password.length < 8) {
        return NextResponse.json({ error: 'Contraseña mínimo 8 caracteres' }, { status: 400 })
    }

    // Buscar el UUID del usuario en Supabase Auth
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 400 })
    }

    const authUser = authUsers.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase())

    if (!authUser) {
        return NextResponse.json({ error: 'Usuario no encontrado en Auth' }, { status: 404 })
    }

    // Actualizar contraseña
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authUser.id,
        { password: nueva_password }
    )

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
    }