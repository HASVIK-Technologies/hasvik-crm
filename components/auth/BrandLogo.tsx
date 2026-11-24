import Image from "next/image";
import { cn } from "@/lib/utils";

// public/brand/hasvik-logo.svg is 414.25 x 130.5 units: the artwork (402.25 x 118.5) plus 6 units of clear space on
// every side. The wrapper below is exactly the artwork, so the logo centres on what you see, not on the empty margin.
const ARTWORK = { width: 402.25, height: 118.5, margin: 6 } as const;

/**
 * The official HASVIK logo, as a vector so it stays sharp at any size and on high-density screens.
 * Its width is the `--lw` CSS variable: set it on this element with a class such as `[--lw:10rem]`.
 */
export default function BrandLogo({ className }: { className?: string }) {
  const { width, height, margin } = ARTWORK;
  return (
    <span className={cn("relative block", className)} style={{ width: "var(--lw)", height: `calc(var(--lw) * ${height} / ${width})` }}>
      <Image
        src="/brand/hasvik-logo.svg"
        alt="HASVIK"
        width={414}
        height={131}
        priority
        unoptimized
        className="absolute h-auto max-w-none"
        style={{
          top: `calc(var(--lw) * -${margin} / ${width})`,
          left: `calc(var(--lw) * -${margin} / ${width})`,
          width: `calc(var(--lw) * ${width + 2 * margin} / ${width})`,
        }}
      />
    </span>
  );
}
