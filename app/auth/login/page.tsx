'use client'

import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

const logo = '/images/logo.png'

export default function Login() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Super admin
    if (email.toLowerCase() === 'pixkki@pixkki.es') {
      router.push('/superadmin')
      return
    }

    // Buscar usuario en BD
    const { data: usuarioData } = await supabase
      .from('usuario')
      .select('id_usuario, id_refugio')
      .eq('correo', email.toLowerCase())
      .eq('activo', true)
      .single()

    if (!usuarioData) {
      setError('Usuario no encontrado o desactivado.')
      setLoading(false)
      return
    }

    // Obtener rol
    const { data: rolData } = await supabase
      .from('usuario_rol')
      .select('rol(nombre_rol)')
      .eq('id_usuario', usuarioData.id_usuario)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nombreRol = (rolData as any)?.rol?.nombre_rol as string | undefined

    const REDIRECT: Record<string, string> = {
      Administrador: '/dashboard',
      Veterinario:   '/dashboard/animals',
      Voluntario:    '/dashboard/adoptions',
      Recepcionista: '/dashboard/adoptions',
    }

    router.push(nombreRol ? (REDIRECT[nombreRol] ?? '/dashboard') : '/dashboard')
  }

  return (
    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 px-1 py-1 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#43AE6D' }}>
          <img src={logo} alt="Logo" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Sistema de Albergues
        </span>
      </div>

      <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
        Bienvenido de vuelta
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Inicia sesión con tu cuenta</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@albergue.com"
            className="w-full px-4 py-3 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="password">
              Contraseña
            </label>
            <button type="button" className="text-xs text-primary hover:opacity-75 transition-opacity">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <input
              id="password" type={showPassword ? 'text' : 'password'}
              autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3 pr-11 text-sm bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-muted-foreground transition-shadow"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ backgroundColor: '#FDF2EA', color: '#E8A87C' }}>
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 mt-2 flex items-center justify-center gap-2 cursor-pointer"
          style={{ backgroundColor: '#43AE6D' }}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}