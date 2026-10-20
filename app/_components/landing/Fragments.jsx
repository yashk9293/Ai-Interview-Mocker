import { Mic, Square, Volume2 } from "lucide-react";
import LiveTranscript from "./LiveTranscript";

// True-size pieces of the product's own interface, used as the page's
// pictures. Each root carries data-ui and follows the app-screen rules.

export const SAMPLE = {
  role: "Frontend developer",
  stack: "React, TypeScript, Next.js",
  years: "3",
  type: "Technical",
  difficulty: "Medium",
  questions: [
    "How does React decide what to re-render, and how would you avoid unnecessary renders?",
    "A page takes four seconds to become interactive. Where do you start?",
    "When would you reach for server components instead of client components?",
    "How would you make a long form accessible to keyboard and screen reader users?",
    "Tell me about a bug that only happened in production. How did you find it?",
  ],
  answer:
    "React re-renders a component when its state or props change, and then its children re-render too. To avoid extra renders I'd keep state close to where it's used and memoise expensive children",
  interim: " with React.memo",
  rating: 7,
  feedback:
    "Clear on what triggers a render and a good instinct on keeping state local. Mention that React compares the new and old trees and only updates the DOM where they differ, and say when memoising isn't worth it: it has a cost of its own.",
  model:
    "React re-renders a component when its state, props or context change, then reconciles the result against the previous tree and commits only the differences to the DOM. Keep state close to where it's used, split context by how often it changes, and memoise only components that are expensive and receive stable props.",
};

function Field({ label, value, wide = false }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[12px] text-faint">{label}</p>
      <p className="mt-1 flex h-10 items-center rounded-md bg-bg px-3 text-[15px] text-ink">{value}</p>
    </div>
  );
}

export function JobForm() {
  return (
    <div data-ui className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface p-5 font-sans">
      <Field label="Job role" value={SAMPLE.role} wide />
      <Field label="Tech stack" value={SAMPLE.stack} wide />
      <Field label="Years of experience" value={SAMPLE.years} />
      <Field label="Difficulty" value={SAMPLE.difficulty} />
    </div>
  );
}

export function QuestionList() {
  return (
    <ol data-ui className="rounded-lg border border-line bg-surface p-2 font-sans" aria-label="Generated questions">
      {SAMPLE.questions.map((question, i) => (
        <li key={i} className={`flex gap-3 rounded-md px-3 py-2.5 text-[15px] leading-snug ${i === 0 ? "bg-raised text-ink" : "text-muted-foreground"}`}>
          <span className="num w-4 shrink-0 text-faint">{i + 1}</span>
          <span>{question}</span>
        </li>
      ))}
    </ol>
  );
}

export function AnswerCard() {
  return (
    <div data-ui className="rounded-lg border border-line bg-surface p-5 font-sans">
      <div className="flex items-start justify-between gap-4">
        <p className="text-[16px] leading-snug text-ink">{SAMPLE.questions[0]}</p>
        <Volume2 className="mt-0.5 size-4 shrink-0 text-faint" aria-hidden="true" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[14px] font-medium text-white">
          <Square className="size-3 fill-current" aria-hidden="true" /> Stop recording
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-faint">
          <Mic className="size-3.5" aria-hidden="true" /> Listening
        </span>
      </div>
    </div>
  );
}

export function TranscriptCard() {
  return (
    <div data-ui className="rounded-lg border border-line bg-surface p-5 font-sans">
      <p className="text-[12px] text-faint">Your answer, as you speak</p>
      <LiveTranscript text={SAMPLE.answer} interim={SAMPLE.interim} />
    </div>
  );
}

export function RatingBar({ rating }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] text-faint">1</span>
      <span className="relative h-2 flex-1 rounded-full bg-raised">
        <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${((rating - 1) / 9) * 100}%` }} />
      </span>
      <span className="text-[12px] text-faint">10</span>
    </div>
  );
}

export function FeedbackSheet() {
  return (
    <article data-ui className="rounded-lg border border-line bg-surface p-6 font-sans">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[16px] font-medium leading-snug text-ink">{SAMPLE.questions[0]}</h3>
        <p className="num shrink-0 text-[24px] text-ink">
          {SAMPLE.rating}<span className="text-[14px] text-faint"> /10</span>
        </p>
      </div>
      <div className="mt-3"><RatingBar rating={SAMPLE.rating} /></div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <section>
          <h4 className="text-[12px] text-faint">What to improve</h4>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{SAMPLE.feedback}</p>
        </section>
        <section className="rounded-md bg-raised p-4">
          <h4 className="text-[12px] text-faint">A strong answer looks like</h4>
          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{SAMPLE.model}</p>
        </section>
      </div>
    </article>
  );
}

export function ScoreChip() {
  return (
    <div data-ui className="w-[min(240px,34vw)] rounded-lg border border-line bg-surface p-4 font-sans">
      <p className="text-[12px] text-faint">Frontend developer · Technical</p>
      <p className="num mt-1 text-[24px] text-ink">
        7.4<span className="text-[14px] text-faint"> /10</span>
      </p>
      <div className="mt-2"><RatingBar rating={7.4} /></div>
    </div>
  );
}
