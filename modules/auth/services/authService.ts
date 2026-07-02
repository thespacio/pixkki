'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

const supabase = getSupabaseBrowserClient()

export type UserRole = 'Administrador' | 'Veterinario' | 'Voluntario' | 'Recepcionista'

export const ROLE_REDIRECT: Record<UserRole, string> = {
  Administrador:  '/dashboard',
  Veterinario:    '/dashboard/animals',
  Voluntario:     '/dashboard/adoptions',
  Recepcionista:  '/dashboard/adoptions',
}

export async function getUserRole(): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  if (user.email.toLowerCase() === 'pixkki@pixkki.es') return null

  const { data: usuarioData } = await supabase
    .from('usuario')
    .select('id_usuario')
    .eq('correo', user.email)
    .eq('activo', true)
    .single()

  if (!usuarioData) return null

  const { data: rolData } = await supabase
    .from('usuario_rol')
    .select('rol(nombre_rol)')
    .eq('id_usuario', usuarioData.id_usuario)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nombreRol = (rolData as any)?.rol?.nombre_rol as UserRole | undefined
  return nombreRol ?? null
}

export async function getRedirectByRole(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email?.toLowerCase() === 'pixkki@pixkki.es') return '/superadmin'
  const role = await getUserRole()
  if (!role) return '/dashboard'
  return ROLE_REDIRECT[role] ?? '/dashboard'
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const redirectTo = await getRedirectByRole()
    return { data, redirectTo }
  },
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
}