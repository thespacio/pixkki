'use client'

import { useEffect, useState } from 'react'
import { getUserRole, UserRole } from '../services/authService'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client'

export function useUserRole() {
  const [role, setRole]                   = useState<UserRole | null>(null)
  const [isSuperAdmin, setIsSuperAdmin]   = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email?.toLowerCase() === 'pixkki@pixkki.es') {
        setIsSuperAdmin(true)
        setLoading(false)
        return
      }
      getUserRole().then(setRole).finally(() => setLoading(false))
    })
  }, [])

  return { role, isSuperAdmin, loading }
}