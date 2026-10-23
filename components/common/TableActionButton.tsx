import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TableActionButtonProps = React.ComponentProps<typeof Button> & {
  tooltip: string;
  tone?: "neutral" | "brand" | "success" | "danger";
};

const tones = {
  neutral: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  brand: "text-brand-blue hover:bg-blue-50 hover:text-brand-blue",
  success: "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
  danger: "text-rose-700 hover:bg-rose-50 hover:text-rose-800",
};

export default function TableActionButton({
  tooltip,
  tone = "neutral",
  className,
  children,
  ...props
}: TableActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={props["aria-label"] ?? tooltip}
          className={cn(
            "size-8 shrink-0 border border-transparent shadow-none transition-colors focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/20",
            tones[tone],
            className,
          )}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}
