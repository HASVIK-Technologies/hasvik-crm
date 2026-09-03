import type { LucideIcon } from "lucide-react";

export default function FormSection({
  icon: Icon,
  title,
  optional = false,
  first = false,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  optional?: boolean;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "" : "mt-6 border-t border-[#edf2f5] pt-6"}>
      <h2 className="flex items-center gap-2 text-base font-bold text-[#163b58]">
        {Icon && (
          <Icon className="size-[18px] text-[#08765d]" strokeWidth={2} />
        )}
        {title}
        {optional && (
          <span className="text-sm font-normal text-[#8a9eaa]">(Optional)</span>
        )}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
