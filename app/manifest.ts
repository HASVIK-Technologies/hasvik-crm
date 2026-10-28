import type { MetadataRoute } from "next";

// Lets phones "Install app" / "Add to Home screen" with the HASVIK icon instead of a generic icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HASVIK CRM",
    short_name: "HASVIK CRM",
    description: "Leads, follow-ups and reports for the HASVIK sales team.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0876d1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
