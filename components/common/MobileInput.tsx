"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { cleanDisplayDigits } from "@/lib/business/contact-numbers";

export { cleanDisplayDigits };

export interface MobileInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  autoComplete?: string;
  className?: string;
  inputClassName?: string;
}

export default function MobileInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  placeholder = "Enter 10-digit mobile number",
  required = false,
  disabled = false,
  invalid = false,
  autoComplete = "tel-national",
  className,
  inputClassName,
}: MobileInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    cleanDisplayDigits(defaultValue)
  );

  useEffect(() => {
    if (!isControlled && defaultValue !== undefined) {
      setInternalValue(cleanDisplayDigits(defaultValue));
    }
  }, [defaultValue, isControlled]);

  const currentDigits = cleanDisplayDigits(isControlled ? value : internalValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = cleanDisplayDigits(e.target.value);
    if (!isControlled) {
      setInternalValue(digitsOnly);
    }
    onChange?.(digitsOnly);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const digitsOnly = cleanDisplayDigits(pastedText);
    if (!isControlled) {
      setInternalValue(digitsOnly);
    }
    onChange?.(digitsOnly);
  };

  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-0 items-center rounded-none border border-slate-300 bg-white text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-400 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/15",
        disabled && "pointer-events-none cursor-not-allowed bg-slate-50 text-slate-500",
        invalid && "border-red-400 ring-2 ring-red-100",
        className
      )}
    >
      {/* +91 Country Tag Prefix */}
      <div className="flex items-center pl-3 pr-2.5 text-slate-700 select-none shrink-0 font-medium text-sm">
        <span>+91</span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Input Field */}
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{10}"
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className={cn(
          "h-full w-full min-w-0 border-0 bg-transparent px-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none shadow-none focus:outline-none focus:ring-0 focus-visible:ring-0",
          inputClassName
        )}
        value={currentDigits}
        onChange={handleChange}
        onPaste={handlePaste}
        disabled={disabled}
        aria-invalid={invalid}
      />
    </div>
  );
}
