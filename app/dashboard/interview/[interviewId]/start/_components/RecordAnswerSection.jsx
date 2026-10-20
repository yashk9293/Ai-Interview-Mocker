"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useSpeechToText from "@/utils/useSpeechToText";
import { Keyboard, LoaderCircle, Mic, RotateCcw, Send, Square, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";
import { saveAnswer } from "@/utils/actions";
import { Panel, PanelHeader, PrimaryButton, Rating, SecondaryButton } from "@/components/app/ui";

// The webcam library is only downloaded once the user turns the camera on.
const Webcam = dynamic(() => import("react-webcam"), { ssr: false });

// Recognition languages: matching the speaker's accent improves accuracy.
const LANGUAGES = [
  { value: "en-IN", label: "English (India)" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
];
const LANG_KEY = "speech-lang";
const MIN_LENGTH = 10;

function initialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (LANGUAGES.some((l) => l.value === saved)) return saved;
  } catch {}
  const browser = typeof navigator !== "undefined" ? navigator.language : "";
  return LANGUAGES.find((l) => l.value === browser)?.value ?? "en-US";
}

// The answer for the current question: record (or type), review and fix the
// transcript, then submit it for rating. Nothing is rated until Submit.
const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [lang, setLang] = useState("en-US");
  // Editable drafts per question, so switching questions never loses one.
  const [drafts, setDrafts] = useState({});
  // { index, rating } of the last answer saved, shown as evidence under it.
  const [saved, setSaved] = useState(null);
  // The question being answered is fixed when recording starts, so moving to
  // another question mid-recording can't attach the answer to the wrong one.
  const recordingQuestionIndex = useRef(null);
  const onRecordingEnd = useRef(null);

  useEffect(() => {
    // Read the saved choice after mount so the server and browser render the same.
    const t = setTimeout(() => setLang(initialLang()), 0);
    return () => clearTimeout(t);
  }, []);

  const {
    error,
    supported,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    lang,
    onEnd: (text, reason) => onRecordingEnd.current?.(text, reason),
  });

  const transcript = results.map((result) => result.transcript.trim()).filter(Boolean).join(" ");
  const draft = drafts[activeQuestionIndex];
  const reviewing = draft !== undefined && !isRecording;

  const setDraft = (index, text) => setDrafts((d) => ({ ...d, [index]: text }));
  const clearDraft = (index) => setDrafts((d) => {
    const next = { ...d };
    delete next[index];
    return next;
  });

  const startRecording = () => {
    setResults([]);
    setSaved(null);
    recordingQuestionIndex.current = activeQuestionIndex;
    startSpeechToText();
  };

  const changeLang = (value) => {
    setLang(value);
    try { localStorage.setItem(LANG_KEY, value); } catch {}
  };

  const submit = async () => {
    const questionIndex = activeQuestionIndex;
    const userAnswer = (drafts[questionIndex] ?? "").trim();
    if (userAnswer.length < MIN_LENGTH) {
      toast("Your answer is too short. Add a sentence or two, then submit.");
      return;
    }
    setLoading(true);
    const resp = await saveAnswer({ mockId: interviewData?.mockId, questionIndex, userAnswer });
    setLoading(false);
    if (resp.error) {
      toast(resp.error);
      return;
    }
    clearDraft(questionIndex);
    setSaved({ index: questionIndex, rating: resp.rating });
    onSaved?.(questionIndex, resp.rating);
    setResults([]);
  };

  // When recording ends, the transcript becomes an editable draft to review.
  useEffect(() => {
    onRecordingEnd.current = (text, reason) => {
      const index = recordingQuestionIndex.current;
      setResults([]);
      if (reason === "limit") toast("That's the 3-minute limit for one answer. Review it below, then submit.");
      if (!text.trim()) {
        if (reason === "stopped") toast("Nothing was heard. Check your microphone, or type your answer instead.");
        return;
      }
      setDrafts((d) => ({ ...d, [index]: d[index] ? `${d[index]} ${text}` : text }));
    };
  });

  const showSaved = saved && saved.index === activeQuestionIndex && !isRecording && !loading && !reviewing;

  return (
    <Panel className="col-span-12 flex flex-col lg:col-span-5">
      <PanelHeader
        title="Your answer"
        action={
          <div className="flex items-center gap-1">
            <label className="sr-only" htmlFor="speech-lang">Speech language</label>
            <select
              id="speech-lang"
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              disabled={isRecording}
              className="h-8 rounded-md border border-line bg-white px-2 text-[13px] text-muted-foreground hover:text-ink disabled:opacity-60"
              title="Choose the English that matches your accent for better recognition"
            >
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setWebCamEnabled(!webCamEnabled)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] text-muted-foreground transition-colors hover:bg-raised hover:text-ink"
            >
              {webCamEnabled ? <VideoOff className="size-4" strokeWidth={1.5} /> : <Video className="size-4" strokeWidth={1.5} />}
              <span className="max-sm:sr-only">{webCamEnabled ? "Camera off" : "Camera on"}</span>
            </button>
          </div>
        }
      />

      {webCamEnabled && (
        <div className="mb-4 aspect-[4/3] overflow-hidden rounded-md bg-raised">
          <Webcam
            mirrored={true}
            audio={false}
            onUserMediaError={() => {
              setWebCamEnabled(false);
              toast("Could not access your webcam");
            }}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {error && (
        <p className="mb-3 rounded-md bg-negative-tint px-4 py-3 text-[14px] text-ink">
          {error}. {supported ? "You can type your answer instead." : "Use Google Chrome to answer out loud, or type your answer below."}
        </p>
      )}

      {reviewing ? (
        /* Review: fix misheard words, then submit for rating */
        <div className="flex flex-1 flex-col">
          <label htmlFor="answer-draft" className="text-[13px] text-muted-foreground">
            Check your answer and fix any misheard words, then submit.
          </label>
          <textarea
            id="answer-draft"
            value={draft}
            onChange={(e) => setDraft(activeQuestionIndex, e.target.value)}
            maxLength={5000}
            placeholder="Type your answer here."
            autoFocus
            className="mt-2 min-h-[160px] flex-1 resize-y rounded-md border border-control bg-white p-3 text-[15px] leading-relaxed text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PrimaryButton type="button" onClick={submit} disabled={loading}>
              {loading ? <><LoaderCircle className="size-4 animate-spin" /> Rating your answer</> : <><Send className="size-4" /> Submit for rating</>}
            </PrimaryButton>
            {supported && !error && (
              <SecondaryButton type="button" onClick={startRecording} disabled={loading}>
                <Mic className="size-4" /> Keep talking
              </SecondaryButton>
            )}
            <button
              type="button"
              onClick={() => clearDraft(activeQuestionIndex)}
              disabled={loading}
              className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-ink"
            >
              <RotateCcw className="size-3.5" /> Start over
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            {supported && !error && (
              <PrimaryButton
                type="button"
                onClick={isRecording ? stopSpeechToText : startRecording}
                className={isRecording ? "bg-negative text-white hover:bg-negative" : ""}
              >
                {isRecording
                  ? <><Square className="size-3 fill-current" /> Stop recording</>
                  : <><Mic className="size-4" /> {showSaved ? "Answer again" : "Record answer"}</>}
              </PrimaryButton>
            )}
            {isRecording ? (
              <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground" aria-live="polite">
                <span className="size-2 animate-pulse rounded-full bg-negative motion-reduce:animate-none" aria-hidden="true" />
                Listening. Pause to think whenever you need.
              </span>
            ) : (
              <button
                type="button"
                onClick={() => { setSaved(null); setDraft(activeQuestionIndex, ""); }}
                className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
              >
                <Keyboard className="size-4" /> Type your answer instead
              </button>
            )}
          </div>

          <div className="mt-4 min-h-[160px] flex-1 rounded-md bg-raised p-4" aria-live="polite">
            {isRecording ? (
              <p className="text-[15px] leading-relaxed text-ink">
                {transcript || interimResult ? <>{transcript} <span className="text-faint">{interimResult}</span></> : <span className="text-muted-foreground">Start speaking…</span>}
              </p>
            ) : showSaved ? (
              <div>
                <p className="text-[14px] text-ink">
                  Saved. Rated <Rating value={saved.rating} size={14} />
                </p>
                <Link href={`/dashboard/interview/${interviewData.mockId}/feedback#q${saved.index}`} className="mt-2 inline-block text-[14px] text-ink underline-offset-4 hover:underline">
                  Read what to improve
                </Link>
              </div>
            ) : (
              <p className="text-[14px] text-muted-foreground">
                Press Record answer and speak. Take your time: pauses won&apos;t end your answer. When you press Stop,
                you can fix any misheard words before it&apos;s rated.
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
};

export default RecordAnswerSection;
