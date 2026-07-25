import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Propostas", short: "Prop." },
  { to: "/empresas", label: "Empresas", short: "Emp." },
  { to: "/clientes", label: "Clientes", short: "Cli." },
  { to: "/itens", label: "Itens", short: "Itens" },
  { to: "/notas-fiscais", label: "Notas fiscais", short: "NFS-e" },
] as const;

type AppShellProps = {
  children: ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  mobileAction?: ReactNode;
};

export function AppShell({ children, isDark, onToggleTheme, mobileAction }: AppShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    await navigate({ to: "/login" });
  };

  return (
    <div className="nexfiscal-app relative min-h-screen">
      <div className="relative z-10 flex min-h-screen">
        <aside className="nf-sidebar fixed inset-y-0 left-0 z-40 hidden w-[13.5rem] flex-col border-r border-white/10 lg:flex">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="font-display text-[1.35rem] leading-none font-semibold tracking-tight">
              Nex<span className="text-[oklch(0.78_0.1_55)]">Fiscal</span>
            </p>
            <p className="mt-2 text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
              Escritório digital
            </p>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn("nf-nav-link", active && "nf-nav-link--active")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-white/10 p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={onToggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Modo claro" : "Modo escuro"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[13.5rem]">
          <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-sm lg:hidden">
            <div
              className="flex h-14 items-center justify-between gap-3 px-4"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <div>
                <p className="font-display text-lg leading-none font-semibold">NexFiscal</p>
                <p className="mt-0.5 text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  Escritório digital
                </p>
              </div>
              <Button variant="outline" size="icon" className="shrink-0" onClick={onToggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>

            <nav className="flex border-t border-border">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex flex-1 items-center justify-center border-b-2 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors",
                      active
                        ? "border-accent text-foreground"
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    {item.short}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:max-w-5xl lg:px-10 lg:pb-10">
            {children}
          </main>
        </div>
      </div>

      {mobileAction ? (
        <div
          className="fixed right-4 bottom-5 z-30 lg:hidden"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          {mobileAction}
        </div>
      ) : null}
    </div>
  );
}
