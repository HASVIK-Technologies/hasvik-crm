import * as React from "react"

import { Button } from "@/components/ui/button"

type SecondaryButtonProps = React.ComponentProps<typeof Button>

export default function SecondaryButton(props: SecondaryButtonProps) {
  return <Button variant="secondary" {...props} />
}
