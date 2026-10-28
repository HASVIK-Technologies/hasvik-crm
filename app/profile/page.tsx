import { redirect } from "next/navigation";

// Profile now lives under Settings.
export default function ProfilePage() {
  redirect("/settings?tab=profile");
}
