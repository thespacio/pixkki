"use client";

type HeaderProps = {
  userEmail?: string | null;
};

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/50 px-6 text-white backdrop-blur">
      <div className="text-sm font-medium text-slate-400">
        Bienvenido de vuelta
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300 font-mono">{userEmail || "usuario@albergue.com"}</span>
        <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
          U
        </div>
      </div>
    </header>
  );
}