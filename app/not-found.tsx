import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 py-12">
      <div className="fade-up w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-pop">
        <Image src="/hasvik-icon.png" alt="" width={56} height={56} className="mx-auto size-14" />
        <span className="mx-auto mt-5 grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-strong"><Compass className="size-6" aria-hidden /></span>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-ink">We can&apos;t find that page</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">The link may be old, or the record may have been removed. Head back to your dashboard and carry on from there.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl bg-btn px-5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-btn-hover">Go to dashboard</Link>
          <Link href="/businesses" className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2">See businesses</Link>
        </div>
      </div>
    </main>
  );
}
