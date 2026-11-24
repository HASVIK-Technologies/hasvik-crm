import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

// The browser tab names the product too, so people know which HASVIK app they are signing in to.
export const metadata: Metadata = { title: "Sign in | HASVIK LEADS" };

export default function Login() {
  return <LoginForm />;
}
