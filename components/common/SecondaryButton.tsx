import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SecondaryButtonProps = React.ComponentProps<typeof Button>

export default function SecondaryButton({ className, ...props }: SecondaryButtonProps) {
  return (
    <Button
      variant="secondary"
      className={cn(
        "bg-[#08765d] text-white hover:bg-[#066a53] shadow-sm",
        className
      )}
      {...props}
    />
  )
}