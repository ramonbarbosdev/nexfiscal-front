import { cn } from "@/lib/utils";

export type FormTab<T extends string> = {
  id: T;
  label: string;
};

type FormTabsProps<T extends string> = {
  tabs: FormTab<T>[];
  active: T;
  onChange: (tab: T) => void;
  className?: string;
};

export function FormTabs<T extends string>({ tabs, active, onChange, className }: FormTabsProps<T>) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-border pb-px", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 rounded-t-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm",
            active === tab.id
              ? "border border-b-0 border-border bg-background text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
