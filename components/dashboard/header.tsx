import { Bell, Search } from 'lucide-react'

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'PX'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 w-64">
        <Search size={14} className="text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar animal, expediente..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          aria-label="Buscar"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={16} className="text-foreground" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
          {initials}
        </div>
      </div>
    </header>
  )
}
