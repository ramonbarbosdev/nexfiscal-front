import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/login-page";
import { getToken } from "@/lib/api-client";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
  head: () => ({
    meta: [{ title: "NexFiscal — Entrar" }],
  }),
});
