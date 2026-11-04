import type { CSSProperties } from "react";

// The decorative stripes on the sign-in page, drawn as inline SVG so their colours are the app's own theme colours
// (--brand-cyan, --brand-blue, --brand-green, --brand-growth in globals.css) and follow any future change to them.
const stop = (variable: string, opacity = 1) => ({ stopColor: `var(--${variable})`, stopOpacity: opacity }) satisfies CSSProperties;
const fill = (variable: string, opacity = 1) => ({ fill: `var(--${variable})`, fillOpacity: opacity }) satisfies CSSProperties;

/** Two soft bands, cyan and green, that fade out downwards. Sits in the top-right corner of the blue panel. */
export function StripesTopRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="360 0 460 330" preserveAspectRatio="xMaxYMin meet" className={className}>
      <defs>
        <linearGradient id="login-art-tr-cyan" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="330">
          <stop offset="0" style={stop("brand-cyan")} />
          <stop offset="0.45" style={stop("brand-blue", 0.9)} />
          <stop offset="1" style={stop("brand-blue", 0)} />
        </linearGradient>
        <linearGradient id="login-art-tr-green" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="330">
          <stop offset="0" style={stop("brand-growth")} />
          <stop offset="0.45" style={stop("brand-green")} />
          <stop offset="1" style={stop("brand-green", 0)} />
        </linearGradient>
      </defs>
      <polygon fill="url(#login-art-tr-cyan)" points="606.4,-40 733.4,-40 507.7,330 380.7,330" />
      <polygon fill="url(#login-art-tr-green)" points="733.4,-40 831.4,-40 605.7,330 507.7,330" />
    </svg>
  );
}

/** A green and a cyan parallelogram rising from the bottom-left corner of the blue panel. */
export function StripesBottomLeft({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="60 850 440 174" preserveAspectRatio="xMinYMax meet" className={className}>
      <defs>
        <linearGradient id="login-art-bl-green" gradientUnits="userSpaceOnUse" x1="232" y1="857" x2="300" y2="1024">
          <stop offset="0" style={stop("brand-growth")} />
          <stop offset="1" style={stop("brand-green")} />
        </linearGradient>
      </defs>
      <polygon style={fill("brand-cyan")} points="355,908 477,908 350.6,1054 228.6,1054" />
      <polygon fill="url(#login-art-bl-green)" points="232,857 392,857 213,1064 53,1064" />
    </svg>
  );
}

/** Pale blue shapes and a green wedge in the bottom-right corner of the white side. */
export function StripesBottomRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="1240 780 296 244" preserveAspectRatio="xMaxYMax meet" className={className}>
      <polygon style={fill("brand-cyan", 0.14)} points="1373,908 1411,908 1256,1044 1251,1044" />
      <polygon style={fill("brand-cyan", 0.22)} points="1256,1044 1560,777 1600,777 1600,1044" />
      <polygon style={fill("brand-growth")} points="1485,908 1600,908 1600,1044 1369,1044" />
    </svg>
  );
}
