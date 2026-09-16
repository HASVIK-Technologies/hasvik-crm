import { Input } from "@/components/ui/input";

export default function MobileInput({
  value,
  onChange,
  disabled = false,
  invalid = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digitsOnly);
  };

  return (
    <div
      className={`flex h-12 min-w-0 flex-1 items-center rounded-xl border bg-background px-3 ${
        disabled ? "opacity-60" : ""
      } ${invalid ? "border-red-400 ring-1 ring-red-100" : ""}`}
    >
      <span className="font-medium text-sm">+91</span>

      <div className="mx-3 h-4 w-px bg-border" />

      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={10}
        placeholder="Mobile number"
        className="border-0 shadow-none focus-visible:ring-0 aria-invalid:ring-0"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={invalid}
      />
    </div>
  );
}
