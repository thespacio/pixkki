    import { NextResponse } from 'next/server'
    import { createClient } from '@supabase/supabase-js'
    import { createSupabaseServerClient } from '@/lib/supabase/server-client'

    const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
    )

    export async function POST(request: Request) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== 'pixkki@pixkki.es') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id_refugio } = await request.json()
    if (!id_refugio) {
        return NextResponse.json({ error: 'Falta id_refugio' }, { status: 400 })
    }

    // 1. Obtener todos los usuarios del refugio
    const { data: usuarios } = await supabaseAdmin
        .from('usuario')
        .select('id_usuario, correo')
        .eq('id_refugio', id_refugio)

    // 2. Desactivar todos los usuarios en la tabla usuario
    await supabaseAdmin
        .from('usuario')
        .update({ activo: false })
        .eq('id_refugio', id_refugio)

    // 3. Deshabilitar sus cuentas en Supabase Auth
    if (usuarios && usuarios.length > 0) {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
        for (const usuario of usuarios) {
        const authUser = authUsers?.users.find(
            (u) => u.email?.toLowerCase() === usuario.correo.toLowerCase()
        )
        if (authUser) {
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            ban_duration: '87600h', // 10 años = efectivamente bloqueado
            })
        }
        }
    }

    // 4. Ocultar el albergue de la página pública
    await supabaseAdmin
        .from('albergue_perfil')
        .update({ visible_publico: false })
        .eq('id_refugio', id_refugio)

    // 5. Marcar el refugio como inactivo
    await supabaseAdmin
        .from('refugio')
        .update({ activo: false })
        .eq('id_refugio', id_refugio)

    return NextResponse.json({ ok: true })
    }