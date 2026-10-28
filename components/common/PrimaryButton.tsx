import * as React from "react"

import { Button } from "@/components/ui/button"

type PrimaryButtonProps = React.ComponentProps<typeof Button>

export default function PrimaryButton(props: PrimaryButtonProps) {
  return <Button variant="default" {...props} />
}
