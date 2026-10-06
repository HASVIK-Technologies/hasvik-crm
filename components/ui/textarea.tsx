import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-slate-900 shadow-sm transition-colors outline-none placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
