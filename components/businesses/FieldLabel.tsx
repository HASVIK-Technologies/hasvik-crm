import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Required fields carry a * ; everything else is simply unmarked (never write "(Optional)"). `optional` is kept so callers still read well. */
export default function FieldLabel({
  htmlFor,
  required = false,
  invalid = false,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  invalid?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 text-sm font-semibold text-ink-soft",
        invalid && "text-bad",
        className,
      )}
    >
      {children}
      {required && (
        <>
          <span aria-hidden className="ml-0.5 text-bad">*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
    </Label>
  );
}
