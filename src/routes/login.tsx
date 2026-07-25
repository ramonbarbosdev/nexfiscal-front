import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/login-page";
import { redirectIfSession } from "@/lib/auth-session";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectIfSession,
  component: LoginPage,
  head: () => ({
    meta: [{ title: "NexFiscal — Entrar" }],
  }),
});
