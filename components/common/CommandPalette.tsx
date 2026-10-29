"use client";

import { useRouter } from "next/navigation";
import { Building2, CornerDownLeft, History, MoonStar, PlusCircle, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTheme } from "@/hooks/use-theme";
import { getBusinesses } from "@/lib/business/api";
import { visibleNavigation } from "@/lib/navigation/items";
import { createLocalStore } from "@/lib/shared/local-store";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

type Group = "Recent" | "Actions" | "Pages" | "Businesses";

interface Entry {
  id: string;
  group: Group;
  label: string;
  hint: string;
  href?: string;
  run?: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

const recents = createLocalStore("hasvik-recent");
const MAX_RECENT = 5;

function readRecent(): Pick<Entry, "id" | "label" | "hint" | "href">[] {
  try {
    const parsed = JSON.parse(recents.get() ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.href === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/** Ctrl/Cmd+K palette: do something, jump to a page, or find a business, without the mouse. */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { preference, choose } = useTheme();
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState(0);
  const debounced = useDebouncedValue(query.trim(), 250);
  const input = useRef<HTMLInputElement>(null);

  const navigation = useMemo(() => visibleNavigation(user), [user]);
  const actions = useMemo<Entry[]>(
    () => [
      { id: "add-business", group: "Actions", label: "Add business", hint: "Create a new lead", href: "/businesses/form", icon: PlusCircle },
      { id: "theme", group: "Actions", label: preference === "dark" ? "Switch to light theme" : "Switch to dark theme", hint: "Change how the app looks", run: () => choose(preference === "dark" ? "light" : "dark"), icon: MoonStar },
    ],
    [preference, choose],
  );
  const pages = useMemo<Entry[]>(
    () => navigation.map((item) => ({ id: item.href, group: "Pages", label: item.label, hint: item.keywords?.split(" ").slice(0, 3).join(", ") ?? "Page", href: item.href, icon: item.icon })),
    [navigation],
  );

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open || debounced.length < 2) return;
    const controller = new AbortController();
    getBusinesses({ search: debounced, page: 1, limit: 6 }, controller.signal)
      .then((result) => setRecords(result.data.map((item) => ({ id: item._id, group: "Businesses" as const, label: item.name, hint: [item.city, typeof item.category === "string" ? item.category : item.category?.name].filter(Boolean).join(" · ") || "Business", href: `/businesses/${item._id}`, icon: Building2 }))))
      .catch(() => setRecords([]));
    return () => controller.abort();
  }, [debounced, open]);

  const q = query.trim().toLowerCase();
  const matches = (entry: Entry, extra = "") => `${entry.label} ${extra}`.toLowerCase().includes(q);
  const entries: Entry[] = q
    ? [
        ...actions.filter((entry) => matches(entry, entry.hint)),
        ...pages.filter((entry) => matches(entry, navigation.find((item) => item.href === entry.href)?.keywords)),
        ...(debounced.length < 2 ? [] : records),
      ]
    : [
        ...readRecent().map((item): Entry => ({ ...item, group: "Recent", icon: History })),
        ...actions,
        ...pages,
      ];

  if (!open) return null;

  const go = (entry: Entry) => {
    if (entry.href && entry.group !== "Recent") {
      const next = [{ id: entry.id, label: entry.label, hint: entry.hint, href: entry.href }, ...readRecent().filter((item) => item.href !== entry.href)].slice(0, MAX_RECENT);
      recents.set(JSON.stringify(next));
    }
    onClose();
    if (entry.run) entry.run();
    else if (entry.href) router.push(entry.href);
  };

  let lastGroup: Group | null = null;

  return (
    <div
      className="fixed inset-0 z-90 flex items-start justify-center bg-ink/55 px-3 pt-[12vh] backdrop-blur-[3px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages and businesses"
        className="pop-in w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-float"
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
          if (event.key === "ArrowDown") { event.preventDefault(); setCursor((c) => Math.min(c + 1, entries.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
          if (event.key === "Enter" && entries[cursor]) { event.preventDefault(); go(entries[cursor]); }
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 shrink-0 text-muted" aria-hidden />
          <input
            ref={input}
            autoFocus
            value={query}
            onChange={(event) => { setQuery(event.target.value); setCursor(0); }}
            placeholder="Search pages, actions or businesses…"
            aria-label="Search"
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-xs font-semibold text-muted sm:block">Esc</kbd>
        </div>
        <ul role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {entries.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">Nothing matches “{query}”. Try a business name or a page like “reports”.</li>}
          {entries.map((entry, index) => {
            const Icon = entry.icon;
            const heading = entry.group !== lastGroup ? entry.group : null;
            lastGroup = entry.group;
            return (
              <li key={`${entry.group}-${entry.id}`} role="presentation">
                {heading && <p role="presentation" className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted">{heading}</p>}
                <button
                  type="button"
                  role="option"
                  aria-selected={index === cursor}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => go(entry)}
                  className={cn("flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors", index === cursor ? "bg-brand-soft" : "hover:bg-surface-2")}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-brand-strong"><Icon className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{entry.label}</span>
                    <span className="block truncate text-xs text-muted">{entry.hint}</span>
                  </span>
                  {index === cursor && <CornerDownLeft className="size-4 shrink-0 text-muted" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
