import { useState } from "react";

export type ToastVariant = "default" | "error" | "warning";

type ToastState = {
  message: string;
  variant: ToastVariant;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = (message: string, variant: ToastVariant = "default") => {
    setToast({ message, variant });
    window.clearTimeout((window as Window & { _toastTimer?: number })._toastTimer);
    (window as Window & { _toastTimer?: number })._toastTimer = window.setTimeout(
      () => setToast(null),
      variant === "error" ? 4200 : 3200,
    );
  };

  return {
    message: toast?.message ?? null,
    variant: toast?.variant ?? "default",
    show,
  };
}
