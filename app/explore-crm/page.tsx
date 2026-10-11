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
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
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
              className="hidden text-sm font-medium text-slate-600 transition hover:text-primary sm:inline"
            >
              Features
            </a>
            <a
              href="#plans"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-primary sm:inline"
            >
              Plans
            </a>
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 hover:text-primary"
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
        <div className="pointer-events-none absolute -left-48 top-8 -z-10 size-[28rem] rounded-full bg-sky-200/40 blur-3xl" />
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-primary shadow-sm">
            <span className="size-2 rounded-full bg-emerald-500" />
            B2B sales, with a better next step
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Turn every business conversation into{" "}
            <span className="text-primary">forward momentum.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
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
              className="h-12 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold"
            >
              <a href="#features">See how it works</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600" />
              Built for B2B teams
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600" />
              Flexible subscription plans
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600" />
              Your team, one clear pipeline
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-sky-200/70 to-emerald-100/80 blur-xl" />
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_90px_-38px_rgba(15,69,115,0.36)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold text-slate-400">YOUR SALES WORKSPACE</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Pipeline overview</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                This week
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4 sm:gap-4 sm:p-6">
              {[
                { label: "Open leads", value: "128", icon: UsersRound, color: "text-blue-600 bg-blue-50" },
                { label: "Follow-ups", value: "24", icon: BellRing, color: "text-amber-600 bg-amber-50" },
                { label: "Won this month", value: "18", icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl border border-slate-100 p-3 sm:p-4">
                  <span className={`flex size-8 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-5 sm:px-6">
              <div className="rounded-2xl bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">Next up</p>
                  <a href="#features" className="text-[11px] font-semibold text-primary">View follow-ups</a>
                </div>
                {[
                  { name: "Northstar Manufacturing", task: "Share revised proposal", time: "10:30 AM", badge: "Today" },
                  { name: "Bluepeak Supplies", task: "Check in after product demo", time: "2:00 PM", badge: "Today" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-3 border-t border-slate-200/70 py-3 first:border-0 first:pt-0 last:pb-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <Clock3 className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-800">{item.name}</span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">{item.task}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[10px] font-semibold text-slate-600">{item.time}</span>
                      <span className="mt-1 block text-[10px] text-slate-400">{item.badge}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl sm:flex">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Check className="size-4" />
            </span>
            <span>
              <span className="block text-xs font-bold text-slate-800">Nothing slips through</span>
              <span className="mt-0.5 block text-[10px] text-slate-500">Every next step stays visible</span>
            </span>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-8 border-y border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">A calmer way to sell</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Keep relationships moving, not just records.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
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
              <article key={number} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-bold tracking-[0.12em] text-slate-300">{number}</span>
                </div>
                <h3 className="mt-6 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-8 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Simple, transparent options</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Plans that fit your next stage.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Compare the available plans. Create your tenant workspace and sign in as its admin before choosing a subscription.
              </p>
            </div>
            <Link href="/tenant" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:text-blue-800 sm:self-auto">
              About tenant signup <ChevronRight className="size-4" />
            </Link>
          </div>

          {plansQuery.isPending ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : plansQuery.isError ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Plans are temporarily unavailable. Please try again in a moment or contact us for current pricing.
            </div>
          ) : plans.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              No plans are available right now. Please check back soon.
            </div>
          ) : (
            <div className="mt-8 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan, index) => (
                <article
                  key={plan._id ?? plan.id ?? plan.code}
                  className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_8px_28px_rgba(20,40,60,0.04)] sm:p-7 ${
                    index === 0 && plans.length > 1
                      ? "border-primary/40 ring-1 ring-primary/15"
                      : "border-slate-200"
                  }`}
                >
                  {index === 0 && plans.length > 1 && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Start here
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                      {plan.description && <p className="mt-1 text-xs leading-5 text-slate-500">{plan.description}</p>}
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {plan.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-950">{formatPrice(plan)}</span>
                    <span className="text-xs text-slate-500">{billingLabel(plan)}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 border-t border-slate-100 pt-5">
                    {(plan.features ?? []).map((feature) => (
                      <li key={feature.code} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        <span>{feature.name}</span>
                      </li>
                    ))}
                    {plan.limits && (
                      <li className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
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
                  <p className="mt-3 text-center text-[11px] leading-5 text-slate-500">
                    Subscription purchase is available after tenant signup and admin sign-in.
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-[#075aa3] via-[#0876d1] to-[#08a9e6] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100">Ready for a clearer pipeline?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Give every lead a thoughtful next step.</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">Explore the CRM, review your options, and set up your team workspace.</p>
          </div>
          <Button asChild className="h-12 shrink-0 rounded-xl bg-white px-5 font-semibold text-primary hover:bg-blue-50">
            <Link href="/tenant">Get started <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Hasvik CRM. Built for better business relationships.</p>
          <Link href="/tenant" className="inline-flex items-center gap-1.5 font-medium hover:text-primary">
            Tenant signup information <CircleHelp className="size-3.5" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
