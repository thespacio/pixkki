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

  if (!user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Obtener id_refugio del admin que hace la petición
  const { data: adminData } = await supabaseAdmin
    .from('usuario')
    .select('id_refugio, id_usuario')
    .eq('correo', user.email)
    .eq('activo', true)
    .single()

  if (!adminData) {
    return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 403 })
  }

  // Verificar que tiene rol Administrador
  const { data: rolData } = await supabaseAdmin
    .from('usuario_rol')
    .select('rol(nombre_rol)')
    .eq('id_usuario', adminData.id_usuario)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((rolData as any)?.rol?.nombre_rol !== 'Administrador') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { correo, password, nombre_completo, nombre_rol } = await request.json()

  const rolesPermitidos = ['Veterinario', 'Voluntario', 'Recepcionista']
  if (!rolesPermitidos.includes(nombre_rol)) {
    return NextResponse.json({ error: 'Rol no permitido' }, { status: 400 })
  }

  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Obtener o crear el rol
  let { data: rolTarget } = await supabaseAdmin
    .from('rol')
    .select('id_rol')
    .eq('nombre_rol', nombre_rol)
    .single()

  if (!rolTarget) {
    const { data: nuevoRol } = await supabaseAdmin
      .from('rol')
      .insert({ nombre_rol, descripcion: nombre_rol })
      .select('id_rol')
      .single()
    rolTarget = nuevoRol
  }

  // Crear usuario en tabla usuario — mismo id_refugio que el admin
  const { data: nuevoUsuario, error: usuarioError } = await supabaseAdmin
    .from('usuario')
    .insert({
      id_refugio: adminData.id_refugio,
      nombre_completo,
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

  // Asignar rol
  await supabaseAdmin.from('usuario_rol').insert({
    id_usuario: nuevoUsuario.id_usuario,
    id_rol: rolTarget!.id_rol,
  })

  return NextResponse.json({ ok: true })
}