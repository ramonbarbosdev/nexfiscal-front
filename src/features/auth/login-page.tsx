import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { ApiError } from "@/lib/api-client";

import { useAuth } from "./auth-context";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@nexfiscal.local");
  const [password, setPassword] = useState("admin123");
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
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nexfiscal-app flex min-h-screen items-center justify-center px-4">
      <div className="nf-panel w-full max-w-md p-8">
        <p className="font-display text-2xl font-semibold">NexFiscal</p>
        <p className="mt-1 text-sm text-muted-foreground">Entre para acessar propostas e notas fiscais.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <FormField label="E-mail" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="nf-input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Senha" htmlFor="password">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="nf-input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormField>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="h-10 w-full font-semibold" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
