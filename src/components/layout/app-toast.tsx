import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { createPortal } from "react-dom";

import type { ToastVariant } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ToastProps = {
  message: string | null;
  variant?: ToastVariant;
};

const VARIANT_META: Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2;
    label: string | null;
    bar: string;
    iconWrap: string;
    ring: string;
  }
> = {
  default: {
    icon: CheckCircle2,
    label: null,
    bar: "bg-primary",
    iconWrap: "bg-primary/10 text-primary",
    ring: "ring-primary/15",
  },
  error: {
    icon: AlertCircle,
    label: "Erro",
    bar: "bg-destructive",
    iconWrap: "bg-destructive/10 text-destructive",
    ring: "ring-destructive/15",
  },
  warning: {
    icon: AlertTriangle,
    label: "Atenção",
    bar: "bg-accent",
    iconWrap: "bg-accent/15 text-accent",
    ring: "ring-accent/20",
  },
};

export function AppToast({ message, variant = "default" }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const meta = VARIANT_META[variant];
  const Icon = meta.icon;
  const show = Boolean(message) && !dismissed;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDismissed(false);
    if (!message) {
      setVisible(false);
      return;
    }

    const enterTimer = window.setTimeout(() => setVisible(true), 10);
    return () => window.clearTimeout(enterTimer);
  }, [message, variant]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "nf-toast-host",
        visible && show ? "nf-toast-host--visible" : "nf-toast-host--hidden",
      )}
      aria-hidden={!show}
    >
      <div
        className={cn("nf-toast ring-1", meta.ring, !show && "nf-toast--hidden")}
        role={variant === "error" ? "alert" : "status"}
        aria-live={variant === "error" ? "assertive" : "polite"}
      >
        <span className={cn("nf-toast__accent", meta.bar)} aria-hidden />

        <span className={cn("nf-toast__icon", meta.iconWrap)} aria-hidden>
          <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
        </span>

        <div className="nf-toast__body">
          {meta.label ? <p className="nf-toast__label">{meta.label}</p> : null}
          <p className="nf-toast__message">{message}</p>
        </div>

        <button
          type="button"
          className="nf-toast__close"
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
