"use client";
import { useEffect } from "react";
import Link from "next/link";
import { container } from "@/components/site/container";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={`${container} flex min-h-[70svh] flex-col items-center justify-center py-16 text-center`}>
      <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        This page couldn&apos;t load. Your interviews and answers are safe. Try again, or go back to the dashboard.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-hover"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-full border border-line px-7 text-base font-medium text-foreground transition hover:border-brand/40 hover:text-brand"
        >
          Go to your interviews
        </Link>
      </div>
    </main>
  );
}
