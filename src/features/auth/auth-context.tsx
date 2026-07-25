import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { ApiError, clearToken, getToken, setToken } from "@/lib/api-client";

import { fetchMe, login, type LoginRequest, type MeResponse } from "./api";

type AuthContextValue = {
  user: MeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useHasStoredToken() {
  return useSyncExternalStore(
    () => () => {},
    () => Boolean(getToken()),
    () => false,
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = useHasStoredToken();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
  });

  useEffect(() => {
    if (!isError) return;
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      clearToken();
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    }
  }, [isError, error, queryClient]);

  const handleLogin = useCallback(
    async (request: LoginRequest) => {
      const response = await login(request);
      setToken(response.accessToken);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    [queryClient],
  );

  const handleLogout = useCallback(() => {
    clearToken();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      isAuthenticated: Boolean(user),
      isLoading: hasToken && isLoading,
      login: handleLogin,
      logout: handleLogout,
    }),
    [user, hasToken, isLoading, handleLogin, handleLogout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
