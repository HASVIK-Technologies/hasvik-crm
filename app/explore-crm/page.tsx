"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  BellRing,
  Building2,
  CalendarDays,
  CalendarCheck2,
  Check,
  ChevronRight,
  CircleHelp,
  FolderKanban,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tag,
  UsersRound,
} from "lucide-react";
import BrandLogo from "@/components/auth/BrandLogo";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlansQuery } from "@/hooks/use-subscriptions";
import type { SubscriptionPlan } from "@/types/subscription";
import { useEffect, useState } from "react";

function formatPrice(plan: SubscriptionPlan) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: plan.currency ?? "INR",
    maximumFractionDigits: 0,
  }).format(plan.price);
}

function billingLabel(plan: SubscriptionPlan) {
  if (plan.billingCycle === "MONTHLY") return "per month";
  if (plan.billingCycle === "YEARLY") return "per year";
  return "one-time";
}

function formatLimit(value: number | undefined) {
  if (value === undefined) return "Not specified";
  return value < 0 ? "Unlimited" : value.toLocaleString("en-IN");
}

const features = [
  {
    number: "01",
    title: "Every lead, in context",
    text: "Keep multiple phone and WhatsApp contacts, categories, owners, customizable tags, and lead details together. Switch between a searchable list and a Kanban pipeline.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Follow through your way",
    text: "Plan calls, WhatsApp messages, emails, visits, and meetings in a list or calendar. Add multiple follow-ups for each lead and keep notes on every touchpoint.",
    icon: CalendarCheck2,
  },
  {
    number: "03",
    title: "A dashboard for each role",
    text: "Give each role a useful view of lead ownership, pipeline progress, team activity, and follow-ups that need attention, on desktop or mobile.",
    icon: BarChart3,
  },
];

const crmScreenshots = [
  { src: "/leads-crm/dashboard.jpg", alt: "HASVIK CRM role based dashboard", title: "Role based dashboard", detail: "Pipeline progress, team activity, and follow-ups that need attention." },
  { src: "/leads-crm/leads.jpg", alt: "HASVIK CRM leads in a list view", title: "Leads list", detail: "Review lead details, owners, status, and recent activity." },
  { src: "/leads-crm/kanaban.jpg", alt: "HASVIK CRM leads in a Kanban pipeline", title: "Kanban pipeline", detail: "Scan leads by stage and see owners and next steps." },
  { src: "/leads-crm/business-followup-history.jpg", alt: "HASVIK CRM lead details and follow-up history", title: "Lead details and history", detail: "Keep contact details, notes, and every follow-up together." },
  { src: "/leads-crm/followups-list.jpg", alt: "HASVIK CRM follow-ups list", title: "Follow-ups list", detail: "Track scheduled touchpoints and their status." },
  { src: "/leads-crm/followups-calendar.jpg", alt: "HASVIK CRM follow-ups calendar", title: "Follow-ups calendar", detail: "See calls, WhatsApp, emails, visits, and meetings by date." },
];

export default function ExploreCrmPage() {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const plansQuery = useSubscriptionPlansQuery();
  const plans = (plansQuery.data ?? []).filter((plan) => plan.isActive !== false);
  const screenshot = crmScreenshots[activeScreenshot];

  function showScreenshot(index: number) {
    setActiveScreenshot((index + crmScreenshots.length) % crmScreenshots.length);
  }

  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = window.setInterval(() => {
      setActiveScreenshot((current) => (current + 1) % crmScreenshots.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isCarouselPaused]);
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8f8] text-[#102b46]">
      <header className="sticky top-0 z-30 border-b border-[#e3ebef] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/explore-crm" aria-label="HASVIK CRM home" className="[--lw:9rem] sm:[--lw:10rem]">
            <BrandLogo />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-7" aria-label="Main">
            <a href="#features" className="hidden text-sm font-semibold text-slate-600 transition hover:text-[#1468ab] sm:inline">Platform</a>
            <a href="#workflow" className="hidden text-sm font-semibold text-slate-600 transition hover:text-[#1468ab] sm:inline">How it works</a>
            <a href="#plans" className="hidden text-sm font-semibold text-slate-600 transition hover:text-[#1468ab] sm:inline">Plans</a>
            <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-[#1468ab]">Sign in</Link>
            <Button asChild className="h-10 rounded-xl bg-[#23a242] px-4 text-sm font-semibold hover:bg-[#198637]">
              <Link href="/tenant">Create workspace <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.96fr] lg:py-28">
        <div className="pointer-events-none absolute -left-48 top-8 -z-10 size-[30rem] rounded-full bg-[#c8e9f5]/50 blur-3xl" />
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cce5dd] bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1468ab] shadow-sm">
            <span className="size-2 rounded-full bg-[#23a242]" />
            HASVIK LEADS CRM
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[#102b46] sm:text-5xl lg:text-[3.65rem]">
            Your leads, pipeline, and follow-ups. <span className="text-[#23a242]">All moving together.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Manage leads from first contact to won or lost. See the full follow-up history, keep notes and tags organized, and make the next step clear for everyone on your team.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-xl bg-[#23a242] px-5 text-sm font-semibold text-white hover:bg-[#198637]">
              <Link href="/tenant">Set up your workspace <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl border-[#d7e2e7] bg-white px-5 text-sm font-semibold text-[#17364f] hover:bg-[#f5faf8]">
              <a href="#workflow">See how it works</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
            {["List and Kanban views", "Multiple contacts per lead", "Mobile responsive"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[#23a242]" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl" onMouseEnter={() => setIsCarouselPaused(true)} onMouseLeave={() => setIsCarouselPaused(false)} onFocus={() => setIsCarouselPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsCarouselPaused(false); }}>
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-[#bfe8f4]/80 via-[#e7f5ee] to-[#d8edf3] blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-[#dfe8eb] bg-white shadow-[0_32px_90px_-38px_rgba(16,43,70,0.4)] sm:rounded-3xl">
            <div className="group relative aspect-[1897/865] w-full overflow-hidden bg-[#edf2f5]" aria-live="polite" aria-label={`${screenshot.title}: ${screenshot.detail}`}>
              {crmScreenshots.map((item, index) => (
                <Image key={item.src} src={item.src} alt={item.alt} fill priority={index === 0} sizes="(max-width: 1024px) 100vw, 50vw" className={`object-cover transition-all duration-700 ease-out ${index === activeScreenshot ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`} />
              ))}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#0b253c]/90 via-[#0b253c]/45 to-transparent p-4 pt-16 text-white sm:p-6 sm:pt-20">
                <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#79d0a2]">HASVIK CRM · {String(activeScreenshot + 1).padStart(2, "0")} / {String(crmScreenshots.length).padStart(2, "0")}</p><h2 className="mt-1 truncate text-lg font-bold sm:text-xl">{screenshot.title}</h2><p className="mt-1 line-clamp-2 max-w-lg text-xs leading-5 text-white/80 sm:text-sm">{screenshot.detail}</p></div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button type="button" variant="outline" size="icon" aria-label="Previous screenshot" onClick={() => showScreenshot(activeScreenshot - 1)} className="size-9 rounded-full border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/25 hover:text-white"><ArrowLeft className="size-4" /></Button>
                  <Button type="button" variant="outline" size="icon" aria-label="Next screenshot" onClick={() => showScreenshot(activeScreenshot + 1)} className="size-9 rounded-full border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/25 hover:text-white"><ArrowRight className="size-4" /></Button>
                </div>
              </div>
              <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-[#102b46]/55 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-md sm:right-5 sm:top-5">CRM preview</div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Explore the workspace</p>
              <div className="flex items-center gap-1.5" role="group" aria-label="Choose CRM screenshot">
                {crmScreenshots.map((item, index) => <button key={item.src} type="button" aria-label={`Show ${item.title}`} aria-current={index === activeScreenshot} onClick={() => showScreenshot(index)} className={`h-1.5 rounded-full transition-all ${index === activeScreenshot ? "w-7 bg-[#23a242]" : "w-1.5 bg-[#b8c7ce] hover:bg-[#1468ab]/60"}`} />)}
              </div>
            </div>
          </div>
        </div>      </section>

      <section id="features" className="scroll-mt-24 border-y border-[#e1e9eb] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#1468ab]">One connected workspace</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102b46] sm:text-4xl">Everything your team needs to build momentum.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">A practical workspace for capturing leads, coordinating follow-ups, and keeping your team aligned.</p>
          </div>
          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {features.map(({ number, title, text, icon: Icon }) => (
              <article key={number} className="rounded-2xl border border-[#e2eaec] bg-[#fbfdfc] p-6 sm:p-7">
                <div className="flex items-center justify-between"><span className={`flex size-11 items-center justify-center rounded-2xl ${number === "02" ? "bg-[#e8f5eb] text-[#198637]" : "bg-[#e6f3f8] text-[#1468ab]"}`}><Icon className="size-5" /></span><span className="text-xs font-bold tracking-[0.12em] text-slate-300">{number}</span></div>
                <h3 className="mt-6 text-base font-bold text-[#17364f]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-3 rounded-2xl border border-[#e2eaec] bg-[#f7faf9] p-5 sm:grid-cols-3 sm:p-6">
            {[
              { icon: Tag, title: "Customizable tags", text: "Label leads and follow-ups to fit your workflow.", color: "text-[#1468ab]" },
              { icon: UsersRound, title: "Work as one team", text: "Manage workspace users and business ownership.", color: "text-[#198637]" },
              { icon: MessageCircle, title: "Quick contact handoff", text: "Open your phone, email, or WhatsApp app for a selected contact.", color: "text-[#1468ab]" },
            ].map(({ icon: Icon, title, text, color }) => <div key={title} className="flex gap-3"><Icon className={`mt-0.5 size-4 shrink-0 ${color}`} /><div><p className="text-xs font-bold text-[#17364f]">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#1468ab]">A simple rhythm for better sales</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102b46] sm:text-4xl">Every lead has a clear next step.</h2><p className="mt-4 text-sm leading-6 text-slate-600">Move a lead through your pipeline, schedule multiple touchpoints, and keep the full history and notes where your team can find them.</p><Link href="/tenant" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1468ab] hover:text-[#0b568f]">Build your workspace <ArrowRight className="size-4" /></Link></div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: "01", icon: Building2, title: "Capture", text: "Add a lead, multiple contacts, tags, and an owner." },
                { step: "02", icon: CalendarDays, title: "Follow up", text: "Schedule calls, WhatsApp, email, visits, or meetings." },
                { step: "03", icon: BarChart3, title: "Move forward", text: "Track the pipeline, notes, and follow-up history." },
              ].map(({ step, icon: Icon, title, text }) => <article key={step} className="rounded-2xl border border-[#e2eaec] bg-white p-5 shadow-[0_8px_28px_rgba(20,40,60,0.035)]"><div className="flex items-center justify-between"><span className={`flex size-10 items-center justify-center rounded-xl ${step === "02" ? "bg-[#e8f5eb] text-[#198637]" : "bg-[#e6f3f8] text-[#1468ab]"}`}><Icon className="size-4" /></span><span className="text-[10px] font-bold tracking-widest text-slate-300">{step}</span></div><h3 className="mt-5 text-sm font-bold text-[#17364f]">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e1e9eb] bg-[#102b46] py-12 text-white sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#70c7c4]">Works with your tools</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Start a conversation from the lead.</h2></div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Phone, title: "Call", text: "Opens your device's caller." },
              { icon: MessageCircle, title: "WhatsApp", text: "Opens a chat with the selected number." },
              { icon: BellRing, title: "Email", text: "Opens your email app." },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4"><Icon className="size-4 text-[#70c7c4]" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#c4d5e3]">{text}</p></div>)}
            <p className="text-xs leading-5 text-[#c4d5e3] sm:col-span-3">Calls, recordings, email, and WhatsApp are not integrated in HASVIK CRM. Meetings are tracked as follow-ups; meeting scheduling services are not integrated.</p>
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-24 border-y border-[#e1e9eb] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#1468ab]">Plans for your next stage</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102b46] sm:text-4xl">Choose the space your team needs.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Compare available plans, create your workspace, and choose a subscription after signing in as its admin.</p></div><Link href="/tenant" className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#1468ab] hover:text-[#0b568f] sm:self-auto">Workspace signup <ChevronRight className="size-4" /></Link></div>
          {plansQuery.isPending ? <div className="mt-8 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-[#f7faf9]" />)}</div> : plansQuery.isError ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Plans are temporarily unavailable. Please try again in a moment or contact us for current pricing.</div> : plans.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-[#fbfdfc] p-8 text-center text-sm text-slate-600">No plans are available right now. Please check back soon.</div> : <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan, index) => <article key={plan._id ?? plan.id ?? plan.code} className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_8px_28px_rgba(20,40,60,0.04)] sm:p-7 ${index === 0 && plans.length > 1 ? "border-[#1468ab]/50 ring-1 ring-[#1468ab]/15" : "border-[#e2eaec]"}`}>{index === 0 && plans.length > 1 && <span className="absolute -top-3 left-6 rounded-full bg-[#1468ab] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Start here</span>}<div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-[#102b46]">{plan.name}</h3>{plan.description && <p className="mt-1 text-xs leading-5 text-slate-500">{plan.description}</p>}</div><span className="rounded-full bg-[#e6f3f8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1468ab]">{plan.billingCycle.toLowerCase()}</span></div><p className="mt-6 flex items-baseline gap-2"><span className="text-3xl font-extrabold tracking-tight text-[#102b46]">{formatPrice(plan)}</span><span className="text-xs text-slate-500">{billingLabel(plan)}</span></p><div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Plan includes</p><ul className="space-y-2">{(plan.features ?? []).map((feature) => <li key={feature.code} className="flex items-start gap-2 text-xs text-slate-600"><Check className="mt-0.5 size-3.5 shrink-0 text-[#1468ab]" /><span><span className="font-semibold">{feature.name}</span>{feature.description && <span className="block text-[11px] leading-4 text-slate-500">{feature.description}</span>}</span></li>)}</ul></div>{plan.limits && <div className="mt-4 rounded-xl border border-[#e7eeec] bg-[#f8fbf9] p-3.5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">Usage limits</p><dl className="space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-500">Team members</dt><dd className="font-semibold text-[#17364f]">{formatLimit(plan.limits.maxUsers)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Leads / businesses</dt><dd className="font-semibold text-[#17364f]">{formatLimit(plan.limits.maxBusinesses)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Follow-ups</dt><dd className="font-semibold text-[#17364f]">{formatLimit(plan.limits.maxFollowUps)}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Notes</dt><dd className="font-semibold text-[#17364f]">{formatLimit(plan.limits.maxNotes)}</dd></div></dl></div>}<Button asChild variant={plan.code === "FREE" ? "default" : index === 0 && plans.length > 1 ? "default" : "outline"} className={`mt-7 h-11 rounded-xl ${plan.code === "FREE" || (index === 0 && plans.length > 1) ? "bg-[#23a242] text-white hover:bg-[#198637]" : "border-[#d7e2e7] text-[#17364f]"}`}><Link href="/tenant">{plan.code === "FREE" ? "Start free" : "Create your workspace"} <ArrowRight className="ml-2 size-4" /></Link></Button><p className="mt-3 text-center text-[11px] leading-5 text-slate-500">{plan.code === "FREE" ? "Activate Free after admin sign-in." : "Choose this plan after workspace signup and admin sign-in."}</p></article>)}</div>}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-[#102b46] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#70c7c4]">Move business forward</p><h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Give your team a clearer way to manage leads.</h2><p className="mt-3 text-sm leading-6 text-[#c4d5e3]">Create a workspace and bring your lead pipeline and follow-ups into focus.</p></div>
          <Button asChild className="h-12 shrink-0 rounded-xl bg-[#23a242] px-5 font-bold text-white hover:bg-[#198637]"><Link href="/tenant">Get started <ArrowRight className="ml-2 size-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-[#e1e9eb] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3"><Link href="/explore-crm" aria-label="HASVIK CRM home" className="[--lw:6.5rem]"><BrandLogo /></Link><span className="text-xs text-slate-400">Â© {new Date().getFullYear()} HASVIK CRM</span></div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500"><Link href="/" className="hover:text-[#1468ab]">Sign in</Link><Link href="/tenant" className="hover:text-[#1468ab]">Create workspace</Link><span className="inline-flex items-center gap-1.5 text-slate-500"><ShieldCheck className="size-3.5 text-[#1468ab]" />Built for your team</span><span className="inline-flex items-center gap-1.5 text-slate-500"><FolderKanban className="size-3.5 text-[#1468ab]" />One connected pipeline</span><Link href="/tenant" className="inline-flex items-center gap-1.5 hover:text-[#1468ab]">Workspace signup <CircleHelp className="size-3.5" /></Link></div>
        </div>
      </footer>
    </main>
  );
}
