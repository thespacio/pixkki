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

  const { correo, password, id_refugio, nombre_refugio } = await request.json()

  if (!correo || !password || !id_refugio) {
    return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
  }

  // 1. Crear perfil del albergue aquí con service_role (salta RLS)
  const slug = nombre_refugio
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { error: perfilError } = await supabaseAdmin
    .from('albergue_perfil')
    .insert({
      id_refugio,
      slug,
      visible_publico: false,
      color_primario: '#43AE6D',
    })

  if (perfilError && !perfilError.message.includes('duplicate')) {
    return NextResponse.json({ error: 'Error al crear perfil: ' + perfilError.message }, { status: 400 })
  }

  // 2. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // 3. Obtener o crear rol Administrador
  let { data: rolData } = await supabaseAdmin
    .from('rol')
    .select('id_rol')
    .eq('nombre_rol', 'Administrador')
    .single()

  if (!rolData) {
    const { data: nuevoRol } = await supabaseAdmin
      .from('rol')
      .insert({ nombre_rol: 'Administrador', descripcion: 'Administrador de albergue' })
      .select('id_rol')
      .single()
    rolData = nuevoRol
  }

  // 4. Crear registro en tabla usuario
  const { data: usuarioData, error: usuarioError } = await supabaseAdmin
    .from('usuario')
    .insert({
      id_refugio,
      nombre_completo: `Admin ${nombre_refugio}`,
      correo,
      password_hash: 'supabase-auth',
      activo: true,
    })
    .select('id_usuario')
    .single()

  if (usuarioError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: usuarioError.message }, { status: 400 })
  }

  // 5. Asignar rol
  await supabaseAdmin.from('usuario_rol').insert({
    id_usuario: usuarioData.id_usuario,
    id_rol: rolData!.id_rol,
  })

  return NextResponse.json({ ok: true })
}