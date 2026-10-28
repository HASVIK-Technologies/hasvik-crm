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
    <section className={first ? "" : "mt-7 border-t border-surface-2 pt-6"}>
      <h2 className="flex items-center gap-2.5 text-base font-bold tracking-tight text-ink">
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-btn/10 text-brand-strong">
            <Icon className="size-4" strokeWidth={2} />
          </span>
        )}
        {title}
        {optional && (
          <span className="text-xs font-medium text-muted">(Optional)</span>
        )}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
