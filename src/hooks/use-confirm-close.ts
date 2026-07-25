import { useCallback, useRef, useState } from "react";

type UseConfirmCloseOptions = {
  open: boolean;
  isDirty: boolean;
  onClose: () => void;
};

export function useConfirmClose({ open, isDirty, onClose }: UseConfirmCloseOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const requestClose = useCallback(() => {
    if (isDirtyRef.current) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      // Fechamento já decidido pelo pai (ex.: após salvar) — não pedir confirmação de novo.
      if (!open) {
        onClose();
        return;
      }
      requestClose();
    },
    [open, onClose, requestClose],
  );

  const confirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  return {
    confirmOpen,
    setConfirmOpen,
    requestClose,
    handleOpenChange,
    confirmDiscard,
  };
}
