import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PrimaryButtonProps = React.ComponentProps<typeof Button>

export default function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "h-10 gap-2 border-primary bg-primary px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)] hover:bg-brand-green-strong",
        className
      )}
      {...props}
    />
  )
}
