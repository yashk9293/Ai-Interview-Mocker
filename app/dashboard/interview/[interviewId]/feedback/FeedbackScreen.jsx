import { ChevronDown } from "lucide-react";
import { averageRating } from "@/utils/interview";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Panel, PrimaryButton, Rating, SecondaryButton, TitleRow, ratingTone } from "@/components/app/ui";

// Feedback. The question: "How did I do, and which answer needs work?"
// One divided strip of figures (the overall score leads at 32px), then every
// question as a row with its rating; the weakest answer opens by default.
function Figure({ label, children, lead = false }) {
  return (
    <div className="px-5 py-4 first:pl-0 max-sm:px-0">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <p className={`num mt-1 leading-none text-ink ${lead ? "text-[32px]" : "text-[24px]"}`}>{children}</p>
    </div>
  );
}

export default function FeedbackScreen({ interview, items }) {
  const answered = items.filter((i) => i.answered);
  const overall = averageRating(answered.map((i) => i.rating));
  const sorted = [...answered].sort((a, b) => a.rating - b.rating);
  const weakest = sorted[0];
  const best = sorted[sorted.length - 1];
  const finding = answered.length === 0
    ? "No answers recorded yet. Record one to get a rating and feedback."
    : `${overall} /10 from ${answered.length} of ${items.length} answers. Your weakest was question ${weakest.questionIndex + 1}, at ${weakest.rating} /10.`;

  return (
    <div className="mx-auto max-w-7xl">
      <TitleRow
        title={`Feedback: ${interview.jobPosition}`}
        line={finding}
        actions={
          <>
            <SecondaryButton href="/dashboard">All interviews</SecondaryButton>
            <PrimaryButton href={`/dashboard/interview/${interview.mockId}/start`}>
              {answered.length === items.length ? "Retake interview" : "Answer the rest"}
            </PrimaryButton>
          </>
        }
      />

      <Panel as="div" className="mb-4 grid grid-cols-2 py-1 sm:grid-cols-4 sm:divide-x sm:divide-line">
        <Figure label="Overall" lead>
          {overall ?? "–"}{overall !== null && <span className="text-[14px] text-faint"> /10</span>}
        </Figure>
        <Figure label="Answered">
          {answered.length}<span className="text-[14px] text-faint"> of {items.length}</span>
        </Figure>
        <Figure label="Best answer">
          {best ? <><span className={ratingTone(best.rating)}>{best.rating}</span><span className="text-[14px] text-faint"> /10</span></> : "–"}
        </Figure>
        <Figure label="Weakest answer">
          {weakest ? <><span className={ratingTone(weakest.rating)}>{weakest.rating}</span><span className="text-[14px] text-faint"> /10</span></> : "–"}
        </Figure>
      </Panel>

      <Panel className="p-2 sm:p-3">
        <h2 className="sr-only">Every question</h2>
        <ul>
          {items.map((item) => (
            <li key={item.questionIndex} id={`q${item.questionIndex}`} className="scroll-mt-24 border-t border-line first:border-t-0">
              <Collapsible defaultOpen={weakest?.questionIndex === item.questionIndex}>
                <CollapsibleTrigger className="group flex w-full items-start gap-4 rounded-md px-3 py-4 text-left transition-colors hover:bg-raised">
                  <span className="num w-5 shrink-0 pt-0.5 text-[14px] text-faint">{item.questionIndex + 1}</span>
                  <span className="min-w-0 flex-1 text-[16px] leading-snug text-ink">{item.question}</span>
                  {item.answered
                    ? <Rating value={item.rating} size={16} className="pt-0.5" />
                    : <span className="whitespace-nowrap pt-0.5 text-[14px] text-faint">Not answered</span>}
                  <ChevronDown className="mt-1 size-4 shrink-0 text-faint transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="grid gap-4 px-3 pb-5 sm:pl-12 lg:grid-cols-2">
                    {item.answered ? (
                      <>
                        <section>
                          <h3 className="text-[12px] text-faint">What you said</h3>
                          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.userAns}</p>
                          <h3 className="mt-4 text-[12px] text-faint">What to improve</h3>
                          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.feedback}</p>
                        </section>
                        <section className="rounded-md bg-raised p-4">
                          <h3 className="text-[12px] text-faint">A strong answer looks like</h3>
                          <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.correctAns}</p>
                        </section>
                      </>
                    ) : (
                      <section className="rounded-md bg-raised p-4 lg:col-span-2">
                        <h3 className="text-[12px] text-faint">A strong answer looks like</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.correctAns}</p>
                      </section>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
