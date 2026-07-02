    import { redirect } from 'next/navigation'
    import { createSupabaseServerClient } from '@/lib/supabase/server-client'

    export default async function SuperAdminLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== 'pixkki@pixkki.es') {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-background" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
        {children}
        </div>
    )
    }