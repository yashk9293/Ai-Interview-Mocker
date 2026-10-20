import Link from "next/link";
import { Suspense } from "react";
import { homeSummary } from "@/utils/interview";
import { Panel, PanelHeader, Rating, SecondaryButton, TitleRow } from "@/components/app/ui";
import AddNewInterview from "./AddNewInterview";
import ScoreLadder from "./ScoreLadder";

// Home. The screen's question: "Am I getting better, and what should I
// practise next?" A 12-column grid on the shared 1280px page width (max-w-7xl).
// Row 1: four count tiles (3 columns each). Row 2: the score ladder (9) and
// the weakest answers (3). The interviews themselves live on the Dashboard page.
function Tile({ label, children, caption, lead = false }) {
  return (
    <Panel as="div" className="col-span-6 flex min-h-[128px] flex-col justify-between p-4 lg:col-span-3">
      <p className="text-[14px] text-muted-foreground">{label}</p>
      <div>
        <p className={`num leading-none text-ink ${lead ? "text-[32px]" : "text-[24px]"}`}>{children}</p>
        <p className="mt-2 text-[12px] text-faint">{caption}</p>
      </div>
    </Panel>
  );
}

const unit = (text) => <span className="text-[14px] text-faint">{text}</span>;

export default function HomeScreen({ interviews, weakest }) {
  const s = homeSummary(interviews);
  const first = interviews[interviews.length - 1];

  return (
    <div className="mx-auto max-w-7xl">
      <TitleRow
        title="Your practice"
        line={s.finding}
        actions={<SecondaryButton href="/dashboard">All interviews</SecondaryButton>}
      />

      <div className="grid grid-cols-12 gap-4">
        <Tile label="Interviews" caption={first ? `since ${new Date(first.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "none yet"}>
          {s.total}
        </Tile>
        <Tile label="Questions answered" caption="out loud, and rated">
          {s.answered}{unit(` of ${s.asked}`)}
        </Tile>
        <Tile label="Average score" caption="across every rated answer">
          {s.average ?? "–"}{s.average !== null && unit(" /10")}
        </Tile>
        <Tile label="Last three" caption="your latest three scored interviews" lead>
          {s.recent ?? "–"}{s.recent !== null && unit(" /10")}
        </Tile>

        <Panel className="col-span-12 flex flex-col lg:col-span-9">
          <PanelHeader title="Score per interview" meta={s.scoredCount ? `${Math.min(s.scoredCount, 12)} latest, out of 10` : null} />
          {s.scoredCount === 0 ? (
            <div className="flex min-h-[200px] flex-1 flex-col items-start justify-center gap-4 rounded-md border border-dashed border-control p-6">
              <p className="max-w-[46ch] text-[16px] text-ink">
                {s.total === 0
                  ? "Your scores will draw here. Create an interview, answer a question out loud, and you'll get your first rating."
                  : "Answer a question in any interview to draw your first point."}
              </p>
              {s.total === 0 && <Suspense fallback={null}><AddNewInterview label="Create your first interview" /></Suspense>}
            </div>
          ) : (
            <ScoreLadder interviews={interviews} average={s.average} />
          )}
        </Panel>

        <Panel className="col-span-12 flex flex-col lg:col-span-3">
          <PanelHeader title="Practise next" meta={weakest.length ? "lowest rated" : null} />
          {weakest.length === 0 ? (
            <div className="flex flex-1 flex-col">
              <p className="text-[14px] text-muted-foreground">Your lowest-rated answers will be listed here, so you know what to retake. Ratings read like this:</p>
              <dl className="mt-4 flex flex-col gap-3 text-[14px]">
                {[
                  ["7 to 10", "Strong: clear, complete, with examples", "text-brand"],
                  ["5 to 6", "Getting there: right idea, gaps in detail", "text-ink"],
                  ["1 to 4", "Worth a retake: off target or too thin", "text-negative"],
                ].map(([range, meaning, tone]) => (
                  <div key={range} className="rounded-md bg-raised px-3 py-2.5">
                    <dt className={`num ${tone}`}>{range}</dt>
                    <dd className="mt-0.5 text-[12px] text-muted-foreground">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <ul className="-mx-2 flex flex-col gap-1">
              {weakest.map((a) => (
                <li key={`${a.mockId}-${a.questionIndex}`}>
                  <Link href={`/dashboard/interview/${a.mockId}/feedback#q${a.questionIndex}`} className="flex gap-3 rounded-md px-2 py-2 transition-colors hover:bg-raised">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-[14px] leading-snug text-ink">{a.question}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-faint">{a.jobPosition}</span>
                    </span>
                    <Rating value={a.rating} size={14} className="pt-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

      </div>
    </div>
  );
}
