import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  ListChecks,
  Mic,
  RotateCcw,
  Sparkles,
  Target,
  Volume2,
} from "lucide-react";
import Header from "@/components/ui/hero-01-utils/header";
import Footer02 from "@/components/ui/footer-02";
import Reveal from "@/components/site/Reveal";
import { container } from "@/components/site/container";
import ClosingCta from "../_components/landing/ClosingCta";
import { AnswerCard, FeedbackSheet, JobForm, QuestionList, TranscriptCard } from "../_components/landing/Fragments";

export const metadata = {
  title: "How it works | AI Interview Mocker",
  description: "Describe the job, get five questions for it, answer out loud, and read a rating, feedback and a model answer for each.",
};

const NAV = [
  { title: "Home", href: "/" },
  { title: "How it works", href: "/how-it-works", isActive: true },
  { title: "FAQ", href: "/faq" },
  { title: "Pricing", href: "/dashboard/upgrade" },
];

const STEPS = [
  {
    id: "describe",
    short: "Describe the job",
    title: "Describe the job you want",
    body: "Type the role, a short job description or tech stack, and your years of experience. Pick the interview type and how hard it should be.",
    points: ["Any role, from engineering to sales", "Technical, behavioral, system design or mixed", "Easy, medium or hard"],
    visual: <JobForm />,
  },
  {
    id: "questions",
    short: "Get your questions",
    title: "Get five questions written for you",
    body: "The AI writes five interview questions for that exact role and level, each with a model answer kept aside for your feedback.",
    points: ["Matched to your stack and experience", "Ready in seconds", "Each question can be read aloud"],
    visual: <QuestionList />,
  },
  {
    id: "answer",
    short: "Answer out loud",
    title: "Answer out loud, like the real thing",
    body: "Press record and speak. Your words appear as you talk, so you can see what the interviewer would hear. Turn the camera on if you want to practise eye contact.",
    points: ["Live transcript while you speak", "Camera optional, never recorded", "Jump between questions freely"],
    visual: (
      <div className="flex flex-col gap-4">
        <AnswerCard />
        <div className="sm:ml-10"><TranscriptCard /></div>
      </div>
    ),
  },
  {
    id: "feedback",
    short: "Read your feedback",
    title: "Read exactly what to improve",
    body: "Every answer is rated out of 10 the moment you stop, with a few lines on what to improve and a strong answer to compare with yours.",
    points: ["A rating for every answer", "Specific, short feedback", "A model answer side by side"],
    visual: <FeedbackSheet />,
  },
];

const FEATURES = [
  { icon: Target, title: "Questions for your exact role", body: "Written for the job, stack and years of experience you enter." },
  { icon: Volume2, title: "Questions read aloud", body: "Hear each question the way an interviewer would ask it." },
  { icon: Mic, title: "Live transcript", body: "See your spoken answer turn into text as you talk." },
  { icon: Sparkles, title: "Instant rating", body: "Every answer scored out of 10 as soon as you stop." },
  { icon: RotateCcw, title: "Unlimited retakes", body: "Record again any time; the new answer replaces the old." },
  { icon: BarChart3, title: "Track your progress", body: "Your average, your last three interviews and what to practise next." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header navigationData={NAV} />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-48 -z-10 flex justify-center">
            <div className="h-[480px] w-[900px] rounded-full bg-brand/10 blur-3xl" />
          </div>
          <div className={`${container} pb-16 pt-16 text-center sm:pt-24`}>
            <span className="fade-up inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3 py-1 text-sm font-medium text-brand">
              <ListChecks className="size-4" aria-hidden="true" /> How it works
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl">
              <span className="mask-line"><span>Four steps to your</span></span>
              <span className="mask-line"><span>best <span className="text-brand">interview</span></span></span>
            </h1>
            <p className="fade-up mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Describe the job, answer five questions out loud, and see exactly where to improve before the real
              interview.
            </p>
            <div className="fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-hover sm:w-auto"
              >
                Start a mock interview <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-line px-7 text-base font-medium text-foreground transition hover:border-brand/40 hover:text-brand sm:w-auto"
              >
                Read the FAQ
              </Link>
            </div>

            {/* The four steps at a glance */}
            <ol className="fade-up mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {STEPS.map((step, i) => (
                <li key={step.id}>
                  <a
                    href={`#${step.id}`}
                    className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-white px-3 py-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_30px_-12px_rgba(72,69,210,0.35)]"
                  >
                    <span className="num flex size-8 items-center justify-center rounded-full bg-brand-tint text-sm font-bold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{step.short}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Steps */}
        <section className={`${container} flex flex-col gap-20 py-16 lg:gap-28 lg:py-24`} aria-label="The steps">
          {STEPS.map((step, i) => (
            <Reveal key={step.id} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div id={step.id} className={`reveal scroll-mt-28 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-sm font-semibold text-brand">
                  Step {i + 1}
                </span>
                <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
                  {step.title}
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{step.body}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-base text-foreground">
                      <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`reveal ${i % 2 === 1 ? "lg:order-1" : ""}`} style={{ "--delay": "120ms" }}>
                <div className="relative rounded-3xl bg-gradient-to-br from-brand-tint via-white to-brand-tint p-4 ring-1 ring-brand/10 sm:p-8">
                  {step.visual}
                </div>
              </div>
            </Reveal>
          ))}
        </section>

        {/* What you get */}
        <section className="border-y border-line bg-surface">
          <div className={`${container} py-16 lg:py-24`}>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-sm font-medium text-brand">
                <FileText className="size-4" aria-hidden="true" /> What you get
              </span>
              <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
                Everything you need to practise
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">One place to rehearse, get honest feedback and track how you&apos;re improving.</p>
            </div>
            <Reveal as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <li
                  key={feature.title}
                  className="reveal rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_8px_30px_-12px_rgba(72,69,210,0.3)]"
                  style={{ "--delay": `${i * 60}ms` }}
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-tint text-brand">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{feature.body}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>

        <ClosingCta />
      </main>
      <Footer02 />
    </>
  );
}
