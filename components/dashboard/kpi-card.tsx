import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    positive: boolean
  }
  accent?: 'primary' | 'secondary' | 'accent' | 'destructive'
}

const accentClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent-foreground',
  destructive: 'bg-destructive/10 text-destructive',
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accent = 'primary',
}: KpiCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                trend.positive ? 'text-secondary' : 'text-destructive',
              )}
            >
              {trend.positive ? '+' : ''}{trend.value} vs. mes anterior
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            accentClasses[accent],
          )}
          aria-hidden="true"
        >
          <Icon size={20} />
        </div>
      </div>
    </article>
  )
}
