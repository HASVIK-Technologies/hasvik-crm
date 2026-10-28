"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlansQuery } from "@/hooks/use-subscriptions";
import type { SubscriptionPlan } from "@/types/subscription";

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

export default function ExploreCrmPage() {
  const plansQuery = useSubscriptionPlansQuery();
  const plans = (plansQuery.data ?? []).filter((plan) => plan.isActive !== false);

  return (
    <main className="min-h-screen overflow-hidden bg-surface-2 text-ink">
      <header className="border-b border-line/80 bg-surface/90">
        <div className="mx-auto flex h-19 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/explore-crm" aria-label="Hasvik CRM home">
            <Image
              src="/logo.png"
              alt="Hasvik"
              width={140}
              height={42}
              priority
              className="w-32"
            />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6" aria-label="Main">
            <a
              href="#features"
              className="hidden text-sm font-medium text-ink-soft transition hover:text-brand-strong sm:inline"
            >
              Features
            </a>
            <a
              href="#plans"
              className="hidden text-sm font-medium text-ink-soft transition hover:text-brand-strong sm:inline"
            >
              Plans
            </a>
            <Link
              href="/"
              className="text-sm font-semibold text-ink-soft hover:text-brand-strong"
            >
              Sign in
            </Link>
            <Button asChild className="h-10 rounded-xl px-4 text-sm">
              <Link href="/tenant">
                Get started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative isolate mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.04fr_0.96fr] lg:py-28">
        <div className="pointer-events-none absolute -left-48 top-8 -z-10 size-112 rounded-full bg-brand/10 blur-3xl" />
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-surface px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-brand-strong shadow-sm">
            <span className="size-2 rounded-full bg-ok" />
            B2B sales, with a better next step
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Turn every business conversation into{" "}
            <span className="text-brand-strong">forward momentum.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
            Hasvik brings your business leads, relationship history, and
            follow-ups into one focused CRM, so your team knows who to contact
            and what to do next.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-xl px-5 text-sm font-semibold">
              <Link href="/tenant">
                Explore plans and get started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl border-line bg-surface px-5 text-sm font-semibold"
            >
              <a href="#features">See how it works</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-ok" />
              Built for B2B teams
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-ok" />
              Flexible subscription plans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-ok" />
              Your team, one clear pipeline
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-brand/15 to-ok-soft/80 blur-xl" />
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-surface-2 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold text-muted">YOUR SALES WORKSPACE</p>
                <p className="mt-1 text-sm font-bold text-ink">Pipeline overview</p>
              </div>
              <span className="rounded-full bg-ok-soft px-3 py-1.5 text-[11px] font-semibold text-ok">
                This week
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
              {[
                { label: "Open leads", value: "128", icon: UsersRound, color: "text-brand-strong bg-brand-soft" },
                { label: "Follow-ups", value: "24", icon: BellRing, color: "text-warn bg-warn-soft" },
                { label: "Won this month", value: "18", icon: BarChart3, color: "text-ok bg-ok-soft" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-surface-2 p-3 sm:p-4">
                  <span className={`flex size-8 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-4 text-xl font-bold tracking-tight text-ink sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] leading-4 text-muted sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-5 sm:px-6">
              <div className="rounded-2xl bg-surface-2 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold text-ink">Next up</p>
                  <a href="#features" className="text-[11px] font-semibold text-brand-strong">View follow-ups</a>
                </div>
                {[
                  { name: "Northstar Manufacturing", task: "Share revised proposal", time: "10:30 AM", badge: "Today" },
                  { name: "Bluepeak Supplies", task: "Check in after product demo", time: "2:00 PM", badge: "Today" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 border-t border-line/70 py-3 first:border-0 first:pt-0 last:pb-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-strong shadow-sm">
                      <Clock3 className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-ink">{item.name}</span>
                      <span className="mt-1 block truncate text-[10px] text-muted">{item.task}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[10px] font-semibold text-ink-soft">{item.time}</span>
                      <span className="mt-1 block text-[10px] text-muted">{item.badge}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-surface-2 bg-surface p-3.5 shadow-xl sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-ok-soft text-ok">
              <Check className="size-4" />
            </span>
            <span>
              <span className="block text-xs font-bold text-ink">Nothing slips through</span>
              <span className="mt-0.5 block text-[10px] text-muted">Every next step stays visible</span>
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-8 border-y border-line/80 bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">A calmer way to sell</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Keep relationships moving, not just records.
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft sm:text-base">
              The essentials for teams managing business-to-business sales,
              without losing sight of the human follow-through.
            </p>
          </div>
          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "One home for every lead",
                text: "Keep business profiles, contact details, and conversation context together for your team.",
                icon: UsersRound,
              },
              {
                number: "02",
                title: "Follow through on time",
                text: "Schedule reminders and see upcoming follow-ups before a promising conversation goes cold.",
                icon: Clock3,
              },
              {
                number: "03",
                title: "Understand your momentum",
                text: "See business activity and sales progress clearly, then focus on the next best action.",
                icon: BarChart3,
              },
            ].map(({ number, title, text, icon: Icon }) => (
              <article key={number} className="rounded-2xl border border-line bg-surface-2 p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-bold tracking-[0.12em] text-muted">{number}</span>
                </div>
                <h3 className="mt-6 text-base font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">Simple, transparent options</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Plans that fit your next stage.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
                Compare the available plans. Create your tenant workspace and sign in as its admin before choosing a subscription.
              </p>
            </div>
            <Link href="/tenant" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-strong hover:text-brand-strong sm:self-auto">
              About tenant signup <ChevronRight className="size-4" />
            </Link>
          </div>

          {plansQuery.isPending ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-line bg-surface" />
              ))}
            </div>
          ) : plansQuery.isError ? (
            <div className="mt-8 rounded-2xl border border-warn/30 bg-warn-soft p-5 text-sm text-warn">
              Plans are temporarily unavailable. Please try again in a moment or contact us for current pricing.
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-soft">
              No plans are available right now. Please check back soon.
            </div>
          ) : (
            <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan, index) => (
                <article
                  key={plan._id ?? plan.id ?? plan.code}
                  className={`relative flex flex-col rounded-2xl border bg-surface p-6 shadow-card sm:p-7 ${
                    index === 0 && plans.length > 1
                      ? "border-brand/40 ring-1 ring-brand/15"
                      : "border-line"
                  }`}
                >
                  {index === 0 && plans.length > 1 && (
                    <span className="absolute -top-3 left-6 rounded-full bg-btn px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Start here
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
                      {plan.description && <p className="mt-1 text-xs leading-5 text-muted">{plan.description}</p>}
                    </div>
                    <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-strong">
                      {plan.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-ink">{formatPrice(plan)}</span>
                    <span className="text-xs text-muted">{billingLabel(plan)}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 border-t border-surface-2 pt-5">
                    {(plan.features ?? []).map((feature) => (
                      <li key={feature.code} className="flex items-start gap-2.5 text-sm text-ink-soft">
                        <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                    {plan.limits && (
                      <li className="flex items-start gap-2.5 text-sm text-ink-soft">
                        <Check className="mt-0.5 size-4 shrink-0 text-ok" />
                        <span>
                          {plan.limits.maxUsers < 0 ? "Unlimited" : plan.limits.maxUsers} team members
                        </span>
                      </li>
                    )}
                  </ul>
                  <Button
                    asChild
                    variant={index === 0 && plans.length > 1 ? "default" : "outline"}
                    className="mt-7 h-11 rounded-xl"
                  >
                    <Link href="/tenant">
                      Create your workspace <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <p className="mt-3 text-center text-[11px] leading-5 text-muted">
                    Subscription purchase is available after tenant signup and admin sign-in.
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-brand-strong via-brand-strong to-brand-strong p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-strong">Ready for a clearer pipeline?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Give every lead a thoughtful next step.</h2>
            <p className="mt-3 text-sm leading-6 text-brand-strong">Explore the CRM, review your options, and set up your team workspace.</p>
          </div>
          <Button asChild className="h-12 shrink-0 rounded-xl bg-surface px-5 font-semibold text-brand-strong hover:bg-brand-soft">
            <Link href="/tenant">Get started <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Hasvik CRM. Built for better business relationships.</p>
          <Link href="/tenant" className="inline-flex items-center gap-1.5 font-medium hover:text-brand-strong">
            Tenant signup information <CircleHelp className="size-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
