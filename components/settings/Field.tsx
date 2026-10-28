import { useId } from "react";

/** Label + control + hint / field-level error, wired together for screen readers. */
export function Field({ label, hint, error, required, children }: {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}{required && <span className="text-bad" aria-hidden> *</span>}
      </label>
      {children(id)}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="text-xs font-medium text-bad">{error}</p>}
    </div>
  );
}
