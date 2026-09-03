import * as React from "react"

import { Button } from "@/components/ui/button"

type PrimaryButtonProps = React.ComponentProps<typeof Button>

export default function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button variant="default" className={className + ' p-3'} {...props} />
  )
}