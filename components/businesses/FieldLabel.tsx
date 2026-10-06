import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function FieldLabel({
  htmlFor,
  required = false,
  optional = false,
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
        "mb-1.5 text-sm font-semibold text-slate-700",
        invalid && "text-red-600",
        className,
      )}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
      {optional && (
        <span className="font-normal text-[#8a9eaa]">(Optional)</span>
      )}
    </Label>
  );
}
