/** App-shaped placeholder (sidebar, top bar, page) shown while the session is restored, so the layout never jumps. */
export default function ShellSkeleton() {
  return (
    <div role="status" aria-label="Opening your workspace" className="min-h-dvh">
      <aside aria-hidden className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface p-4 lg:block">
        <div className="skeleton h-10 w-36" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton h-11" />)}
        </div>
      </aside>
      <div className="lg:pl-64">
        <div aria-hidden className="flex h-14 items-center justify-between border-b border-line bg-surface/80 px-4 sm:h-16 sm:px-6">
          <div className="skeleton h-6 w-32" />
          <div className="flex gap-2"><div className="skeleton h-10 w-40" /><div className="skeleton size-10 rounded-full" /></div>
        </div>
        <div aria-hidden className="space-y-4 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="skeleton h-40 rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton h-28 rounded-2xl" />)}</div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
      <span className="sr-only">Opening your workspace…</span>
    </div>
  );
}
