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
      className={`flex h-11 min-w-0 flex-1 items-center rounded-xl border bg-surface shadow-card transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-(--ring) sm:h-10 ${
        disabled ? "opacity-60" : ""
      } ${invalid ? "border-bad ring-2 ring-bad/20" : "border-line hover:border-muted"}`}
    >
      <span aria-hidden className="flex h-full items-center rounded-l-xl border-r border-line bg-surface-2 px-3 text-base font-medium text-ink-soft sm:text-sm">+91</span>

      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]{10}"
        maxLength={10}
        autoComplete="tel-national"
        placeholder="Mobile number"
        aria-label="Mobile number, 10 digits"
        className="h-full rounded-l-none rounded-r-xl border-0 bg-transparent shadow-none focus-visible:ring-0 aria-invalid:ring-0"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={invalid}
      />
    </div>
  );
}
