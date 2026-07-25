import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SuggestOption = {
  id: string | number;
  label: string;
  subtitle?: string;
};

type SuggestInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: SuggestOption) => void;
  options: SuggestOption[];
  placeholder?: string;
  className?: string;
  maxResults?: number;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

function useDropdownPosition(anchorRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [position, setPosition] = useState<DropdownPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, open]);

  return position;
}

export function SuggestInput({
  value,
  onChange,
  onSelect,
  options,
  placeholder,
  className,
  maxResults = 8,
}: SuggestInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return options
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, maxResults);
  }, [value, options, maxResults]);

  const showSuggestions = open && filtered.length > 0;
  const position = useDropdownPosition(containerRef, showSuggestions);

  useEffect(() => {
    if (!showSuggestions) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-suggest-dropdown]")) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [showSuggestions]);

  const handleSelect = (option: SuggestOption) => {
    onSelect(option);
    setOpen(false);
    inputRef.current?.blur();
  };

  const dropdown =
    showSuggestions && position
      ? createPortal(
          <ul
            data-suggest-dropdown=""
            className="fixed z-[100] max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            role="listbox"
          >
            {filtered.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  className={cn(
                    "flex w-full flex-col rounded-sm px-2.5 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  <span className="truncate font-medium">{option.label}</span>
                  {option.subtitle ? (
                    <span className="truncate text-xs text-muted-foreground">{option.subtitle}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {dropdown}
    </div>
  );
}
