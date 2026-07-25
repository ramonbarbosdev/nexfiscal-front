import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { ToastVariant } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string | null;
  variant?: ToastVariant;
};

export function AppToast({ message, variant = "default" }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "nf-toast",
        variant === "error" && "nf-toast--error",
        variant === "warning" && "nf-toast--warning",
        !message && "nf-toast--hidden",
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {message}
    </div>,
    document.body,
  );
}
