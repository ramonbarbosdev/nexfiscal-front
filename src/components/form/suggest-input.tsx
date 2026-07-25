import { useEffect, useMemo, useRef, useState } from "react";

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

  useEffect(() => {
    if (!showSuggestions) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (containerRef.current?.contains(target)) return;
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
      {showSuggestions ? (
        <ul
          data-suggest-dropdown=""
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
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
        </ul>
      ) : null}
    </div>
  );
}
