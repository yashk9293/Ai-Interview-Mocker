"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Headphones, LoaderCircle, Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { toast } from "sonner";
import useLiveInterview from "@/utils/useLiveInterview";
import SimliPlayer from "@/utils/simliPlayer";
import InterviewerOrb from "@/components/app/InterviewerOrb";
import { DIFFICULTIES, INTERVIEW_TYPES } from "@/utils/interview";
import { Panel, PanelHeader, PrimaryButton, SecondaryButton, TitleRow, ratingTone } from "@/components/app/ui";

const BEFORE = [
  { icon: Radio, text: "It's a conversation: the interviewer asks each question out loud, may ask a follow-up, and you can interrupt it." },
  { icon: Headphones, text: "Headphones work best, so the interviewer doesn't hear itself. Chrome is recommended." },
  { icon: Mic, text: "Each answer is rated as the interviewer moves on; the feedback opens when you finish." },
];

// The live interview. The question: "Am I in a real conversation, and is
// it hearing me?" Grid 7 + 5: the interviewer on the left, captions right.
// With `avatarEnabled`, the interviewer is a lip-synced Simli face; until it
// connects, or if it can't, the orb stands in.
export default function LiveInterview({ interview, avatarEnabled }) {
  const router = useRouter();
  const total = interview.questions.length;
  const video = useRef(null);
  const audio = useRef(null);
  const [avatarStatus, setAvatarStatus] = useState(null);
  const createPlayer = useCallback(
    () => new SimliPlayer({ video: video.current, audio: audio.current, onStatus: setAvatarStatus }),
    []
  );
  const live = useLiveInterview({
    mockId: interview.mockId,
    questionCount: total,
    createPlayer: avatarEnabled ? createPlayer : undefined,
  });
  const showAvatar = avatarStatus === "ready" && (live.status === "live" || live.status === "finishing");
  const captionsEnd = useRef(null);
  const feedbackUrl = `/dashboard/interview/${interview.mockId}/feedback`;

  useEffect(() => {
    captionsEnd.current?.scrollIntoView({ block: "nearest" });
  }, [live.captions]);

  useEffect(() => {
    if (live.status !== "done") return;
    if (live.droppedEarly) toast("The call ended early. The answers you gave were rated.");
    router.push(feedbackUrl);
  }, [live.status, live.droppedEarly, router, feedbackUrl]);

  const inCall = live.status === "live";
  const graded = Object.values(live.results).filter((r) => r.state !== "grading").length;
  const status = {
    idle: "Ready when you are",
    connecting: "Connecting to the interviewer",
    live: live.candidateSpeaking ? "Listening" : live.speaking ? "Speaking" : "Your turn",
    finishing: `Rating your answers (${graded} of ${Object.keys(live.results).length} done)`,
    done: "Opening your feedback",
    error: "The interview couldn't start",
  }[live.status];

  return (
    <div className="mx-auto max-w-7xl">
      <TitleRow
        title={interview.jobPosition}
        line={`Live interview · ${INTERVIEW_TYPES[interview.interviewType]} · ${DIFFICULTIES[interview.difficulty]} · ${total} questions`}
        actions={inCall && (
          <SecondaryButton type="button" onClick={live.end}>
            <PhoneOff className="size-4" aria-hidden="true" /> End interview
          </SecondaryButton>
        )}
      />

      <div className="grid grid-cols-12 gap-4">
        <Panel className="col-span-12 flex flex-col items-center lg:col-span-7">
          <div className="flex min-h-[280px] w-full flex-1 flex-col items-center justify-center gap-6 rounded-md bg-raised py-10">
            {/* Always in the page, so the avatar can attach to them on start. */}
            <video
              ref={video}
              autoPlay
              playsInline
              muted
              className={`${showAvatar ? "" : "hidden"} aspect-square w-full max-w-[320px] rounded-lg bg-black object-cover transition-shadow ${live.candidateSpeaking ? "ring-4 ring-positive/40" : ""}`}
            />
            <audio ref={audio} autoPlay />
            {!showAvatar && (
              <InterviewerOrb size="lg" speaking={live.speaking} listening={live.candidateSpeaking} getLevel={live.getLevel} />
            )}
            <div className="text-center">
              <p className="text-[16px] font-medium text-ink">Interviewer</p>
              <p className="mt-1 text-[14px] text-muted-foreground" aria-live="polite">{status}</p>
            </div>
          </div>

          <ol className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Questions">
            {interview.questions.map((_, i) => {
              const result = live.results[i];
              const current = live.questionIndex === i && inCall;
              return (
                <li
                  key={i}
                  aria-current={current ? "step" : undefined}
                  className={`flex h-12 w-16 flex-col items-center justify-center rounded-md text-[14px] ${current ? "bg-brand text-white" : "bg-raised text-ink"}`}
                >
                  <span className="num leading-none">{i + 1}</span>
                  <span className={`num mt-1 text-[12px] leading-none ${current ? "text-white/80" : result?.state === "done" ? ratingTone(result.rating) : "text-faint"}`}>
                    {current ? "now"
                      : result?.state === "done" ? `${result.rating}/10`
                      : result?.state === "grading" ? "rating"
                      : result?.state === "skipped" ? "no answer"
                      : result?.state === "error" ? "not saved"
                      : "open"}
                  </span>
                </li>
              );
            })}
          </ol>

          {live.error && (
            <p className="mt-5 w-full rounded-md bg-negative-tint px-4 py-3 text-[14px] text-ink">{live.error}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {(live.status === "idle" || live.status === "error") && (
              <PrimaryButton type="button" onClick={live.start}>
                <Radio className="size-4" aria-hidden="true" /> {live.status === "error" ? "Try again" : "Start live interview"}
              </PrimaryButton>
            )}
            {(live.status === "connecting" || live.status === "finishing" || live.status === "done") && (
              <p className="inline-flex items-center gap-2 text-[14px] text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> {status}
              </p>
            )}
            {inCall && (
              <SecondaryButton type="button" onClick={live.toggleMute} aria-pressed={live.muted}>
                {live.muted ? <MicOff className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
                {live.muted ? "Unmute" : "Mute"}
              </SecondaryButton>
            )}
          </div>
        </Panel>

        <Panel className="col-span-12 flex max-h-[560px] flex-col lg:col-span-5">
          {live.status === "idle" || (live.status === "error" && live.captions.length === 0) ? (
            <>
              <PanelHeader title="How it works" />
              <ul className="flex flex-col gap-3">
                {BEFORE.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-[14px] leading-relaxed text-ink">
                    <Icon className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.5} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <PanelHeader title="Live captions" meta={inCall ? "as you speak" : null} />
              <div className="-mx-1 flex-1 overflow-y-auto px-1" aria-live="off">
                {live.captions.length === 0 && <p className="text-[14px] text-faint">Waiting for the interviewer to say hello.</p>}
                <ul className="flex flex-col gap-3">
                  {live.captions.map((c) => (
                    <li key={c.id} className={c.who === "candidate" ? "pl-6" : "pr-6"}>
                      <p className="text-[12px] text-faint">{c.who === "candidate" ? "You" : "Interviewer"}</p>
                      <p className={`mt-0.5 rounded-md px-3 py-2 text-[14px] leading-relaxed ${c.who === "candidate" ? "bg-brand-tint text-ink" : "bg-raised text-ink"}`}>
                        {c.text.trim()}
                      </p>
                    </li>
                  ))}
                </ul>
                <div ref={captionsEnd} />
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
