import { useCallback, useState } from "react";

type UseConfirmCloseOptions = {
  isDirty: boolean;
  onClose: () => void;
};

export function useConfirmClose({ isDirty, onClose }: UseConfirmCloseOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) return;
      requestClose();
    },
    [requestClose],
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
