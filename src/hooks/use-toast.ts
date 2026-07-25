import { useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = (msg: string) => {
    setMessage(msg);
    window.clearTimeout((window as Window & { _toastTimer?: number })._toastTimer);
    (window as Window & { _toastTimer?: number })._toastTimer = window.setTimeout(
      () => setMessage(null),
      2200,
    );
  };

  return { message, show };
}
