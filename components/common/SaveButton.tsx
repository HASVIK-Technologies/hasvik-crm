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
        "h-10 border-brand-blue bg-brand-blue px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.12)] hover:bg-[#0662ad]",
        className,
      )}
      {...props}
    />
  );
}
