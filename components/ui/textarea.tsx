import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base sm:text-sm leading-5 text-ink shadow-sm transition-colors outline-none placeholder:text-muted focus-visible:border-brand-strong focus-visible:ring-4 focus-visible:ring-(--ring) disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted disabled:opacity-100 aria-invalid:border-bad/30 aria-invalid:ring-2 aria-invalid:ring-bad-soft",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
