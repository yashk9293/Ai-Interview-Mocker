import { Check, Mic, Radio, Volume2 } from "lucide-react";
import { DIFFICULTIES, INTERVIEW_TYPES, averageRating } from "@/utils/interview";
import { Panel, PanelHeader, PrimaryButton, Rating, SecondaryButton, TextAction, TitleRow } from "@/components/app/ui";
import WebcamPreview from "./WebcamPreview";

// Interview intro. The question: "What will this interview cover, and am I
// ready to start?" Grid: 8 + 4 on the shared 1280px page width.
const READY = [
  { icon: Mic, text: "Allow the microphone when your browser asks. Answers are typed from your voice, best in Google Chrome." },
  { icon: Volume2, text: "Each question can be read aloud. Answer in your own words, at least a sentence or two." },
  { icon: Check, text: "Every answer is rated out of 10 straight away. You can retake any question as often as you like." },
];

export default function IntroScreen({ interview, items }) {
  const answered = items.filter((i) => i.answered);
  const score = averageRating(answered.map((i) => i.rating));
  const started = answered.length > 0;

  return (
    <div className="mx-auto max-w-7xl">
      <TitleRow
        title={interview.jobPosition}
        line={`${INTERVIEW_TYPES[interview.interviewType]} · ${DIFFICULTIES[interview.difficulty]} · ${interview.jobExperience} years of experience · ${items.length} questions`}
        actions={
          <>
            {/* A spoken, two-way call; the main button is the question-by-question flow. */}
            <SecondaryButton href={`/dashboard/interview/${interview.mockId}/live`}>
              <Radio className="size-4" aria-hidden="true" /> Live interview
            </SecondaryButton>
            <PrimaryButton href={`/dashboard/interview/${interview.mockId}/start`}>
              {started ? "Continue interview" : "Start interview"}
            </PrimaryButton>
          </>
        }
      />

      {started && (
        <Panel as="div" className="mb-4 flex flex-wrap items-center justify-between gap-3 py-4">
          <p className="text-[14px] text-ink">
            <span className="num">{answered.length}</span> of <span className="num">{items.length}</span> answered so far, scoring{" "}
            <Rating value={score} size={14} />
          </p>
          <TextAction href={`/dashboard/interview/${interview.mockId}/feedback`}>Read the feedback</TextAction>
        </Panel>
      )}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
          <Panel>
            <PanelHeader title="The job you described" />
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-ink">{interview.jobDesc}</p>
          </Panel>
          <Panel>
            <PanelHeader title="Before you start" />
            <ul className="flex flex-col gap-3">
              {READY.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                  <Icon className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.5} aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel className="col-span-12 lg:col-span-4">
          <PanelHeader title="Camera check" meta="optional" />
          <WebcamPreview />
          <p className="mt-3 text-[12px] leading-relaxed text-faint">Only you see the camera. Nothing is recorded or uploaded.</p>
        </Panel>
      </div>
    </div>
  );
}
