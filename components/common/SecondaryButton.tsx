import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SecondaryButtonProps = React.ComponentProps<typeof Button>

export default function SecondaryButton({ className, ...props }: SecondaryButtonProps) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "bg-secondary text-white border-secondary hover:bg-secondary/90 rounded-sm p-4 text-base font-normal",
        className
      )}
      {...props}
    />
  )
}