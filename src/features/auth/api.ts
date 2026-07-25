import { apiRequest } from "@/lib/api-client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

export type MeResponse = {
  id: number;
  email: string;
  nome: string;
  permissoes: string[];
};

export function login(request: LoginRequest) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: request,
    auth: false,
  });
}

export function fetchMe() {
  return apiRequest<MeResponse>("/auth/me");
}
