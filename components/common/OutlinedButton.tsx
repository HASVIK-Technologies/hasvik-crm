import * as React from "react"

import { Button } from "@/components/ui/button"

type OutlinedButtonProps = React.ComponentProps<typeof Button>

export default function OutlinedButton({ className, ...props }: OutlinedButtonProps) {
  return <Button variant="outline" className={className} {...props} />
}