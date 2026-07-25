export function isFormDirty<T>(current: T | null | undefined, initial: T | null | undefined): boolean {
  if (current == null || initial == null) return false;
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function cloneFormState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
