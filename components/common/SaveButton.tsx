import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SaveButtonProps = React.ComponentProps<typeof Button>;

export default function SaveButton({
  className,
  ...props
}: SaveButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "h-9 rounded-lg bg-primary px-4 font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
        className,
      )}
      {...props}
    />
  );
}
