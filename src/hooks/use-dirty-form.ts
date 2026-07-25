import { useCallback, useState } from "react";

import { cloneFormState, isFormDirty } from "@/lib/form-dirty";

export function useDirtyForm<T>(initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [baseline, setBaseline] = useState<T | null>(initialValue);

  const isDirty = isFormDirty(value, baseline);

  const reset = useCallback((next: T | null) => {
    if (next === null) {
      setValue(null);
      setBaseline(null);
      return;
    }
    const snapshot = cloneFormState(next);
    setValue(snapshot);
    setBaseline(cloneFormState(snapshot));
  }, []);

  return { value, setValue, isDirty, reset };
}
