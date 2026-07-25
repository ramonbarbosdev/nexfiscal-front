import { useEffect, type ReactNode } from "react";

import { DiscardChangesDialog } from "@/components/form/discard-changes-dialog";
import { useConfirmClose } from "@/hooks/use-confirm-close";

export type ConfirmCloseApi = {
  requestClose: () => void;
  handleOpenChange: (open: boolean) => void;
};

type ConfirmCloseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDirty: boolean;
  description?: string;
  children: (api: ConfirmCloseApi) => ReactNode;
};

export function ConfirmClose({
  open,
  onOpenChange,
  isDirty,
  description,
  children,
}: ConfirmCloseProps) {
  const {
    confirmOpen,
    setConfirmOpen,
    requestClose,
    handleOpenChange,
    confirmDiscard,
  } = useConfirmClose({
    open,
    isDirty,
    onClose: () => onOpenChange(false),
  });

  useEffect(() => {
    if (open) setConfirmOpen(false);
  }, [open, setConfirmOpen]);

  return (
    <>
      {children({ requestClose, handleOpenChange })}
      <DiscardChangesDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmDiscard}
        description={description}
      />
    </>
  );
}
