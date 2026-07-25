import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, FileText, Loader2, Moon, Receipt, Sun } from "lucide-react";

import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api-client";

import { useAuth } from "./auth-context";

const FEATURES = [
  {
    icon: FileText,
    title: "Propostas comerciais",
    description: "Orçamentos, itens e status em um só lugar.",
  },
  {
    icon: Receipt,
    title: "Notas fiscais de serviço",
    description: "Rascunho, emissão e controle de NFS-e.",
  },
] as const;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nexfiscal-app nf-login-shell">
      <aside className="nf-login-brand">
        <div>
          <div className="flex items-start justify-between gap-4">
            <p className="nf-login-brand__eyebrow">Escritório digital</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={toggleTheme}
              aria-label={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <h1 className="nf-login-brand__title">
            Nex<span>Fiscal</span>
          </h1>
          <p className="nf-login-brand__lead">
            Gestão de propostas e notas fiscais de serviço, com a clareza de um livro-caixa
            e a precisão que o seu escritório exige.
          </p>
        </div>

        <ul className="nf-login-features">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="nf-login-feature">
              <span className="nf-login-feature__icon" aria-hidden>
                <Icon className="h-4 w-4" />
              </span>
              <p className="nf-login-feature__text">
                <strong>{title}</strong>
                {description}
              </p>
            </li>
          ))}
        </ul>
      </aside>

      <main className="nf-login-form-wrap">
        <div className="nf-login-card">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="nf-login-card__header">
              <h1>Entrar</h1>
              <p>Acesse sua conta para continuar.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="hidden h-9 w-9 shrink-0 lg:inline-flex"
              onClick={toggleTheme}
              aria-label={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
            <FormField label="E-mail" htmlFor="email" required>
              <Input
                id="email"
                name="nf-login-email"
                type="email"
                autoComplete="off"
                inputMode="email"
                placeholder="seu@email.com"
                className="h-10 rounded-none border-border bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                readOnly
                onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                required
              />
            </FormField>

            <FormField label="Senha" htmlFor="password" required>
              <div className="relative">
                <Input
                  id="password"
                  name="nf-login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="••••••••"
                  className="h-10 rounded-none border-border bg-background pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  readOnly
                  onFocus={(e) => e.currentTarget.removeAttribute("readonly")}
                  data-1p-ignore
                  data-lpignore="true"
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            {error ? (
              <div className="nf-login-error" role="alert">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-none font-semibold"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="nf-login-footer">Conexão segura via API · JWT</p>
        </div>
      </main>
    </div>
  );
}
