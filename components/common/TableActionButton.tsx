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
  neutral: "text-muted hover:bg-surface-2 hover:text-ink",
  brand: "text-brand-strong hover:bg-brand-soft hover:text-brand-strong",
  success: "text-ok hover:bg-ok-soft hover:text-ok",
  danger: "text-bad hover:bg-bad-soft hover:text-bad",
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
            "size-8 shrink-0 border border-transparent shadow-none transition-colors focus-visible:border-brand-strong focus-visible:ring-2 focus-visible:ring-brand/20",
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
