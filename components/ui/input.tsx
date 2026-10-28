import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      suppressHydrationWarning
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3.5 py-2 text-base sm:h-10 sm:text-sm text-ink shadow-card transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted hover:border-muted focus-visible:border-brand-strong focus-visible:ring-4 focus-visible:ring-(--ring) disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:opacity-100 aria-invalid:border-bad/30 aria-invalid:ring-2 aria-invalid:ring-bad-soft",
        className
      )}
      {...props}
    />
  )
}

export { Input }
