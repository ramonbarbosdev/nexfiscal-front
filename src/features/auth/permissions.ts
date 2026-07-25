import type { MeResponse } from "./api";

export function hasPermission(user: MeResponse | null | undefined, permission: string): boolean {
  return Boolean(user?.permissoes.includes(permission));
}
