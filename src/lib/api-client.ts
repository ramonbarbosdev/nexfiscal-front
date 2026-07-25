const TOKEN_KEY = "nexfiscal:token";

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorResponse = {
  status: number;
  erro?: string;
  mensagem?: string;
  details?: ApiFieldError[];
  path?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ApiFieldError[];

  constructor(message: string, status: number, code?: string, details?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "http://localhost:8085/api";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && payload && typeof payload === "object") {
      const error = payload as ApiErrorResponse;
      throw new ApiError(
        error.mensagem ?? error.erro ?? "Erro na requisição",
        response.status,
        error.erro,
        error.details,
      );
    }
    throw new ApiError(
      typeof payload === "string" && payload ? payload : "Erro na requisição",
      response.status,
    );
  }

  return payload as T;
}
