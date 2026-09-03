import * as React from "react"

import { Button } from "@/components/ui/button"

type SecondaryButtonProps = React.ComponentProps<typeof Button>

export default function SecondaryButton({ className, ...props }: SecondaryButtonProps) {
  return (
    <Button variant="secondary" className={className} {...props} />
  )
}