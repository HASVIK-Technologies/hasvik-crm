"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface TrendActual {
  key: string;
  label: string;
  value: number;
}

export interface TrendForecast {
  key: string;
  label: string;
  low: number;
  expected: number;
  high: number;
}

const W = 640;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 24, left: 34 };

/**
 * Actuals as a solid line and the forecast as a dashed line inside a shaded low-high band. Points are buttons so the
 * chart works with touch and keyboard; selecting one reports it through `onSelect` (and the readout line).
 */
export default function TrendChart({ actual, forecast, ariaLabel, unit = "", onSelect }: {
  actual: TrendActual[];
  forecast: TrendForecast[];
  ariaLabel: string;
  unit?: string;
  onSelect?: (key: string, kind: "actual" | "forecast") => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const total = actual.length + forecast.length;
  const max = Math.max(1, ...actual.map((p) => p.value), ...forecast.map((p) => p.high));
  const x = (i: number) => PAD.left + (total <= 1 ? 0 : (i / (total - 1)) * (W - PAD.left - PAD.right));
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);

  const actualPath = actual.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const offset = actual.length;
  const lastActual = actual.at(-1);
  const joinX = lastActual ? x(offset - 1) : x(0);
  const joinY = lastActual ? y(lastActual.value) : y(0);
  const expectedPath = [`M${joinX},${joinY}`, ...forecast.map((p, i) => `L${x(offset + i)},${y(p.expected)}`)].join(" ");
  const band = forecast.length
    ? [`M${joinX},${joinY}`, ...forecast.map((p, i) => `L${x(offset + i)},${y(p.high)}`), ...[...forecast].reverse().map((p, i) => `L${x(offset + forecast.length - 1 - i)},${y(p.low)}`), "Z"].join(" ")
    : "";
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t * 10) / 10);

  const all = [
    ...actual.map((p, i) => ({ ...p, kind: "actual" as const, index: i, readout: `${p.value} ${unit}` })),
    ...forecast.map((p, i) => ({ key: p.key, label: p.label, value: p.expected, kind: "forecast" as const, index: offset + i, readout: `${p.expected} ${unit} expected (range ${p.low} to ${p.high})` })),
  ];
  const shown = all.find((p) => p.key === active);

  return (
    <div>
      <p aria-live="polite" className="mb-2 min-h-5 text-sm text-ink-soft tabular">
        {shown ? <><span className="font-semibold text-ink">{shown.label}</span> · {shown.readout.trim()}{shown.kind === "forecast" ? " · estimate" : ""}</> : <span className="text-muted">Tap a point to see its value</span>}
      </p>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="h-auto w-full">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth={1} />
              <text x={PAD.left - 6} y={y(t) + 4} textAnchor="end" className="fill-muted text-[10px]">{t}</text>
            </g>
          ))}
          {band && <path d={band} className="fill-brand/20" />}
          {actual.length > 1 && <path d={actualPath} fill="none" className="stroke-brand-strong" strokeWidth={2.5} strokeLinejoin="round" />}
          {forecast.length > 0 && <path d={expectedPath} fill="none" className="stroke-accent" strokeWidth={2.5} strokeDasharray="6 5" strokeLinejoin="round" />}
          {all.filter((_, i) => i % Math.max(1, Math.ceil(total / 8)) === 0).map((p) => (
            <text key={p.key} x={x(p.index)} y={H - 6} textAnchor="middle" className="fill-muted text-[10px]">{p.label.slice(2)}</text>
          ))}
        </svg>
        {/* Touch and keyboard targets laid over the points. */}
        <div className="pointer-events-none absolute inset-0">
          {all.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-label={`${p.label}: ${p.readout}${p.kind === "forecast" ? ", estimate" : ""}`}
              onClick={() => { setActive(p.key); onSelect?.(p.key, p.kind); }}
              onFocus={() => setActive(p.key)}
              className="pointer-events-auto absolute size-9 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-(--ring)"
              style={{ left: `${(x(p.index) / W) * 100}%`, top: `${(y(p.kind === "actual" ? p.value : forecast[p.index - offset].expected) / H) * 100}%` }}
            >
              <span className={cn("mx-auto block size-2.5 rounded-full ring-2 ring-surface", p.kind === "actual" ? "bg-brand-strong" : "bg-accent", active === p.key && "scale-150")} />
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-0.5 w-5 bg-brand-strong" />Actual</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="w-5 border-t-2 border-dashed border-accent" />Expected (estimate)</li>
        <li className="flex items-center gap-1.5"><span aria-hidden className="h-3 w-5 rounded-sm bg-brand/20" />Low to high range</li>
      </ul>
    </div>
  );
}
