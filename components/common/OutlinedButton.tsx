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
        "h-10 border-slate-300 bg-white! px-4 text-sm font-semibold text-slate-700! shadow-none hover:border-brand-blue hover:bg-blue-50! hover:text-brand-blue!",
        className,
      )}
      {...props}
    />
  );
}
