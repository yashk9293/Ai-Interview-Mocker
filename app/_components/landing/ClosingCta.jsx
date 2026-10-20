import Link from "next/link";
import { ArrowRight, Check, Mic } from "lucide-react";

// The closing call to action: one purple card, the question and the two
// choices on the left, a glimpse of the feedback you get on the right.
export default function ClosingCta() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
        {/* Soft light in the corners */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-indigo-300/20 blur-3xl" />

        <div className="relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-balance text-4xl font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Ready for the real one?
            </h2>
            <p className="mt-5 max-w-lg text-lg text-white/90">
              Your first mock interview takes a minute to set up. Answer out loud, get a rating on every answer, and
              walk into the real thing prepared.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-brand transition hover:-translate-y-0.5 hover:bg-brand-tint"
              >
                Start practising <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard/upgrade"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-base font-medium text-white transition hover:bg-white/10"
              >
                See pricing
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
              {["Free to start", "No card needed", "Works in your browser"].map((item) => (
                <li key={item} className="inline-flex items-center gap-2">
                  <Check className="size-4" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* A sample of the product's feedback, for a sense of what you get */}
          <div className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="rotate-[-2deg] rounded-2xl bg-white p-6 text-foreground shadow-2xl shadow-black/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Frontend developer · Technical</span>
                <span className="rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-semibold text-brand">Sample</span>
              </div>
              <p className="mt-3 text-base font-semibold leading-snug">
                How does React decide what to re-render?
              </p>
              <div className="mt-4 flex items-end justify-between">
                <p className="num text-4xl font-extrabold tracking-tight text-foreground">
                  7<span className="text-lg font-medium text-muted-foreground">/10</span>
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mic className="size-3.5" aria-hidden="true" /> Answered out loud
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-raised">
                <div className="h-2 w-2/3 rounded-full bg-brand" />
              </div>
              <p className="mt-4 rounded-lg bg-surface p-3 text-sm leading-relaxed text-muted-foreground">
                Clear on what triggers a render. Next time, mention how React compares trees and when memoising
                isn&apos;t worth it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
