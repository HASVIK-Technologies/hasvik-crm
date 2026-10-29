import type { MetadataRoute } from "next";
import { BRAND_THEME_COLOR } from "@/lib/shared/brand";

// Lets phones "Install app" / "Add to Home screen" with the HASVIK icon instead of a generic icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "HASVIK CRM",
    short_name: "HASVIK CRM",
    description: "Leads, follow-ups and reports for the HASVIK sales team.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    categories: ["business", "productivity"],
    theme_color: BRAND_THEME_COLOR,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    // Long-press the app icon (Android) or right-click it (desktop) to jump straight to these.
    shortcuts: [
      { name: "Add business", short_name: "Add business", url: "/businesses/form", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Follow-ups", short_name: "Follow-ups", url: "/follow-ups", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Businesses", short_name: "Businesses", url: "/businesses", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
