import { BarChart3, CalendarCheck2, Filter, type LucideIcon } from "lucide-react";

/**
 * What this sign-in page says. Every HASVIK app shares the layout and the HASVIK logo but has its own name, so people can
 * tell at a glance, even on a phone, which app they are signing in to. An HR portal would change `name`, the texts and
 * the three points here and nothing else.
 */
export const PRODUCT = {
  name: "LEADS",
  headline: "Your B2B Lead Management Platform",
  intro: "Capture, track, and convert business opportunities with a simple and powerful CRM.",
} as const;

export interface LoginPoint {
  icon: LucideIcon;
  /** Theme colour class for the icon on its white tile. */
  color: string;
  title: string;
  text: string;
}

export const LOGIN_POINTS: readonly LoginPoint[] = [
  { icon: Filter, color: "text-brand-cyan", title: "Manage Your Pipeline", text: "Track leads from first contact to closure." },
  { icon: CalendarCheck2, color: "text-brand-green", title: "Never Miss a Follow-up", text: "Stay on top of calls, meetings, and next actions." },
  { icon: BarChart3, color: "text-brand-blue", title: "Grow Your Business", text: "Turn leads into long-term customers." },
];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
