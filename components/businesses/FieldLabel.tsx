import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function FieldLabel({
  htmlFor,
  required = false,
  optional = false,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn("mb-1.5 font-semibold text-[#163b58]", className)}
    >
      {children}
      {required && <span className="text-red-500">*</span>}
      {optional && (
        <span className="font-normal text-[#8a9eaa]">(Optional)</span>
      )}
    </Label>
  );
}
