import Link from "next/link";
import { ArrowRight, HelpCircle, MessageCircle } from "lucide-react";
import Header from "@/components/ui/hero-01-utils/header";
import Footer02 from "@/components/ui/footer-02";
import FaqExplorer from "./FaqExplorer";
import { FAQS } from "./faqs";

export const metadata = {
  title: "FAQ | AI Interview Mocker",
  description: "Answers about practising interviews out loud: browsers, webcams, ratings, privacy and plans.",
};

const NAV = [
  { title: "Home", href: "/" },
  { title: "How it works", href: "/how-it-works" },
  { title: "FAQ", href: "/faq", isActive: true },
  { title: "Pricing", href: "/dashboard/upgrade" },
];

// FAQ structured data, so search engines can show the answers directly.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <Header navigationData={NAV} />
      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-48 -z-10 flex justify-center">
            <div className="h-[480px] w-[900px] rounded-full bg-brand/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="fade-up inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1 text-sm font-medium text-brand">
                <HelpCircle className="size-4" aria-hidden="true" /> Help centre
              </span>
              <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl">
                <span className="mask-line"><span>Questions?</span></span>
                <span className="mask-line"><span>We&apos;ve got <span className="text-brand">answers</span></span></span>
              </h1>
              <p className="fade-up mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
                Everything about practising out loud: your browser and microphone, how answers are rated, your
                privacy, and plans.
              </p>
            </div>
            <div className="mt-10">
              <FaqExplorer />
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border border-line bg-surface px-6 py-10 text-center sm:px-10">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white">
              <MessageCircle className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Still have a question?</h2>
              <p className="mt-2 text-muted-foreground">
                The quickest way to learn is to try it: your first mock interview is free. Or send a message and
                we&apos;ll get back to you.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                Start a mock interview <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="https://www.linkedin.com/in/yashk9293/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-white px-6 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:text-brand"
              >
                Message us on LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer02 />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
