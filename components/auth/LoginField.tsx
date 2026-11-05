"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LoginFieldProps = Omit<ComponentProps<typeof Input>, "id" | "aria-invalid" | "aria-describedby"> & {
  label: string;
  icon: LucideIcon;
  /** The validation message to show under the field, if any. */
  error?: string;
  /** Something to place inside the field at the right end, e.g. the show/hide password button. */
  action?: ReactNode;
};

/** One labelled sign-in field: label, leading icon, the input, and its error wired up for screen readers. */
export default function LoginField({ label, icon: Icon, error, action, className, ...inputProps }: LoginFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          {...inputProps}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-14 rounded-none border-input bg-card pl-12 text-base text-foreground shadow-xs placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-brand-blue focus-visible:ring-4 focus-visible:ring-brand-blue/25",
            action ? "pr-14" : undefined,
            className,
          )}
        />
        {action}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
