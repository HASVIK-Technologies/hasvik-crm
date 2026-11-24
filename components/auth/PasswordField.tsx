"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import LoginField from "@/components/auth/LoginField";

type PasswordFieldProps = Omit<ComponentProps<typeof LoginField>, "icon" | "type" | "action">;

/** The password field with a show/hide button. The button keeps one label and reports its state with aria-pressed. */
export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <LoginField
      {...props}
      icon={LockKeyhole}
      type={visible ? "text" : "password"}
      action={
        <button
          type="button"
          aria-label="Show password"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          // Password-manager extensions add attributes to buttons next to password fields before React hydrates.
          suppressHydrationWarning
          className="absolute top-1/2 right-0 grid size-14 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-brand-blue"
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </button>
      }
    />
  );
}
