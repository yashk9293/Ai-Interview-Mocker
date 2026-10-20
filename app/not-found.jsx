import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/ui/hero-01-utils/header";
import { container } from "@/components/site/container";

export const metadata = {
  title: "Page not found | AI Interview Mocker",
};

const NAV = [
  { title: "Home", href: "/" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq" },
  { title: "Pricing", href: "/dashboard/upgrade" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header navigationData={NAV} />
      <main className={`${container} flex flex-1 flex-col items-center justify-center py-20 text-center`}>
        <p className="text-sm font-semibold text-brand">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl">Page not found</h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          This page doesn&apos;t exist, or the interview was deleted. Your other interviews are on the dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-hover"
          >
            Go to your interviews <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-7 text-base font-medium text-foreground transition hover:border-brand/40 hover:text-brand"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
