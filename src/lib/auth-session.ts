import { redirect } from "@tanstack/react-router";

import { getToken } from "@/lib/api-client";

/** Rotas protegidas: localStorage só existe no browser. No SSR não redireciona. */
export function redirectIfNoSession() {
  if (typeof window === "undefined") return;
  if (!getToken()) {
    throw redirect({ to: "/login" });
  }
}

/** Rota de login: se já autenticado no browser, manda para home. */
export function redirectIfSession() {
  if (typeof window === "undefined") return;
  if (getToken()) {
    throw redirect({ to: "/" });
  }
}
