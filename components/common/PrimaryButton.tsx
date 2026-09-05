import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PrimaryButtonProps = React.ComponentProps<typeof Button>

export default function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button variant="default" className={cn("p-3", className)} {...props} />
  )
}