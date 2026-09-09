import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  wrapperClassName?: string;
}

export default function SearchInput({
  className,
  wrapperClassName,
  placeholder = "Search...",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
      <Input
        type="search"
        placeholder={placeholder}
        className={cn("pl-10 bg-white min-h-9", className)}
        {...props}
      />
    </div>
  );
}
