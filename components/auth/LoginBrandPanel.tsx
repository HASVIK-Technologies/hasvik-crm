import { LOGIN_POINTS, PRODUCT } from "@/components/auth/login-content";
import { StripesBottomLeft, StripesTopRight } from "@/components/auth/LoginArt";

/** "HASVIK LEADS". The product word is the theme lime, lightened so it reads (3:1 or better) on the blue. */
function ProductName({ className }: { className: string }) {
  return (
    <p className={`font-bold text-white ${className}`}>
      HASVIK <span className="text-[color-mix(in_srgb,var(--brand-growth)_60%,white)]">{PRODUCT.name}</span>
    </p>
  );
}

/**
 * The blue half of the sign-in page: a compact header on phones, the full panel from desktop width.
 * Static content, so it renders on the server and adds nothing to the page's JavaScript.
 */
export default function LoginBrandPanel() {
  return (
    <aside
      aria-label={`About HASVIK ${PRODUCT.name}`}
      className="relative isolate overflow-hidden bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-blue)_90%,black),var(--brand-blue))] px-6 pt-10 pb-16 text-white short:pt-6 short:pb-11 [clip-path:polygon(0_0,100%_0,100%_calc(100%-32px),0_100%)] lg:flex lg:flex-col lg:justify-center lg:p-16 lg:[clip-path:none]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <StripesTopRight className="absolute top-0 right-0 aspect-[460/330] h-[130px] lg:h-[36%]" />
        {/* Only where there is free space under the text: tall desktop screens. */}
        <StripesBottomLeft className="absolute bottom-0 left-0 hidden aspect-[440/174] h-[min(18%,calc(50dvh-19.5rem))] [@media(min-width:1024px)_and_(min-height:860px)]:block" />
      </div>

      <div className="relative max-w-xl">
        <span aria-hidden className="mb-4 block h-1 w-16 bg-brand-growth lg:mb-5 lg:w-20" />
        <ProductName className="text-lg leading-none tracking-[0.06em] lg:text-[clamp(1.375rem,1.9vw,2.25rem)] lg:tracking-[0.08em]" />
        {/* A paragraph, not a heading: the page's one heading is "Welcome back" in the form. */}
        <p className="mt-3 short:mt-2 max-w-[80%] text-2xl leading-tight font-bold lg:mt-10 lg:max-w-none lg:text-[clamp(2rem,3.4vw,3.5rem)] lg:leading-[1.12] lg:tracking-tight">
          {PRODUCT.headline}
        </p>
        <p className="mt-5 hidden max-w-lg text-lg leading-relaxed text-white/90 lg:block">{PRODUCT.intro}</p>
        <ul className="mt-10 hidden space-y-5 lg:block">
          {LOGIN_POINTS.map(({ icon: Icon, color, title, text }) => (
            <li key={title} className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white">
                <Icon className={`size-6 ${color}`} strokeWidth={2.2} aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-semibold">{title}</span>
                <span className="block text-base leading-relaxed text-white/90">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
