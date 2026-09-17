import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OutlinedButtonProps = React.ComponentProps<typeof Button>;

export default function OutlinedButton({
  className,
  ...props
}: OutlinedButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "border-primary text-primary! bg-white! hover:bg-primary/5! rounded-sm p-4 text-base font-normal",
        className,
      )}
      {...props}
    />
  );
}
