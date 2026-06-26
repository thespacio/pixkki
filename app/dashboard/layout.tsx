import { redirect } from 'next/navigation'
// Cambiado a rutas relativas para evitar errores de alias de TypeScript/Turbopack
import { Sidebar } from "../components/dashboard/sidebar"
import { Header } from "../components/dashboard/header"
import { createSupabaseServerClient } from "@/lib/supabase/server-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userEmail={user.email} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}