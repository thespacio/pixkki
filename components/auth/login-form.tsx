'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

export function LoginForm() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace("/dashboard");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }
  return (
      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
        )}

        {/* Google */}

        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-60"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
          >
            <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.3 2.6-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.2 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.5-2.4 4.6-4.6 6.1l.1-.1 6.3 5.3C36.7 39.6 44 34 44 24c0-1.3-.1-2.3-.4-3.5z"
            />
          </svg>

          Continuar con Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            o continúa con correo
          </span>
          </div>
        </div>

        {/* Email */}

        <div className="space-y-1.5">
          <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
          >
            Correo electrónico
          </label>

          <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pixkki.com"
              className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
        </div>

        <div className="space-y-1.5">
          <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
          >
            Contraseña
          </label>

          <div className="relative">
            <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-input bg-card px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
            />

            <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-muted-foreground">Recordarme</span>
          </label>

          <button
              type="button"
              className="font-medium text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
              <LogIn size={16} />
          )}

          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Al iniciar sesión aceptas nuestros{' '}
          <a href="#" className="underline hover:text-foreground">
            Términos de uso
          </a>{' '}
          y{' '}
          <a href="#" className="underline hover:text-foreground">
            Política de privacidad
          </a>
          .
        </p>
      </form>
  )
}