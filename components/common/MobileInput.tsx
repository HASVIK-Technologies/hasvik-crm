import { Input } from "@/components/ui/input";

export default function MobileInput({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digitsOnly);
  };

  return (
    <div
      className={`flex h-12 min-w-0 flex-1 items-center rounded-xl border bg-background px-3 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <span className="font-medium text-sm">+91</span>

      <div className="mx-3 h-4 w-px bg-border" />

      <Input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={10}
        placeholder="Mobile number"
        className="border-0 shadow-none focus-visible:ring-0"
        value={value}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}
