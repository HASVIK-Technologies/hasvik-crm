import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PrimaryButtonProps = React.ComponentProps<typeof Button>

export default function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "bg-[#0b63e5] text-white hover:bg-[#0952be] shadow-[0_2px_10px_rgba(11,99,229,0.28)]",
        className
      )}
      {...props}
    />
  )
}