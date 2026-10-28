"use client";

import ThemeToggle from "@/components/common/ThemeToggle";

export default function AppearanceSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-ink">Theme</h3>
        <p className="mt-1 text-sm text-muted">Light, dark, or follow your device. Your choice is remembered in this browser.</p>
      </div>
      <ThemeToggle className="w-full max-w-sm [&>button]:flex-1" />
    </div>
  );
}
