import * as React from "react";

import { Button } from "@/components/ui/button";

type OutlinedButtonProps = React.ComponentProps<typeof Button>;

export default function OutlinedButton(props: OutlinedButtonProps) {
  return <Button variant="outline" {...props} />;
}
