import * as React from "react"

import { Button } from "@/components/ui/button"

type PlainButtonProps = React.ComponentProps<typeof Button>

export default function PlainButton({ className, ...props }: PlainButtonProps) {
  return <Button variant="ghost" className={className} {...props} />
}