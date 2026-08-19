import { Input } from "@/components/ui/input";

export default function MobileInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex h-12 items-center rounded-xl border bg-background px-3">
      <span className="font-medium text-sm">+91</span>

      <div className="mx-3 h-4 w-px bg-border" />

      <Input
        type="tel"
        placeholder="Mobile number"
        className="border-0 shadow-none focus-visible:ring-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}