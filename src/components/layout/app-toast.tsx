type ToastProps = {
  message: string | null;
};

export function AppToast({ message }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xl transition-all ${
        message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
