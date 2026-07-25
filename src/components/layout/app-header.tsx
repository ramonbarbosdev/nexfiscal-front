import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, Moon, Receipt, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Propostas", icon: FileText },
  { to: "/notas-fiscais", label: "Notas Fiscais", icon: Receipt },
] as const;

type AppHeaderProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 md:px-8"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Receipt className="h-[18px] w-[18px] text-primary-foreground" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-[15px] font-semibold tracking-tight">NexFiscal</span>
            <span className="truncate text-[10px] leading-none text-muted-foreground">
              Gestão fiscal
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={onToggleTheme}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 sm:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
