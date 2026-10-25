"use client";
import React from "react";
import { Play, RotateCcw, Square } from "lucide-react";
import InterviewerOrb from "@/components/app/InterviewerOrb";

// The interviewer: an orb that moves with its voice, what it's doing now,
// and controls to replay, stop, or turn automatic reading off.
export default function Interviewer({ voice, questionNumber, listening, autoRead, onAutoReadChange, onPlay }) {
  const speaking = voice.state === "speaking";

  const status = listening
    ? "Listening to your answer"
    : !voice.supported
      ? "Your browser can't read questions aloud"
      : speaking
        ? `Asking question ${questionNumber}`
        : voice.blocked
          ? "Press play to hear the question"
          : "Waiting for your answer";

  return (
    <div className="flex items-center gap-4 rounded-md bg-raised p-3">
      <InterviewerOrb speaking={speaking} listening={listening} getLevel={voice.getLevel} />

      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-ink">Interviewer</p>
        <p className="truncate text-[13px] text-muted-foreground" aria-live="polite">{status}</p>
      </div>

      {voice.supported && (
      <div className="flex shrink-0 items-center gap-1">
        {voice.state === "idle" ? (
          <button
            type="button"
            onClick={onPlay}
            disabled={listening}
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] transition-colors disabled:opacity-50
              ${voice.blocked ? "bg-brand text-white hover:bg-brand-hover" : "text-muted-foreground hover:bg-white hover:text-ink"}`}
          >
            {voice.blocked ? <Play className="size-4" strokeWidth={1.5} /> : <RotateCcw className="size-4" strokeWidth={1.5} />}
            {voice.blocked ? "Play" : "Replay"}
          </button>
        ) : (
          <button
            type="button"
            onClick={voice.stop}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-white hover:text-ink"
          >
            <Square className="size-4" strokeWidth={1.5} />
            Stop
          </button>
        )}
        <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-white hover:text-ink">
          <input
            type="checkbox"
            checked={autoRead}
            onChange={(e) => onAutoReadChange(e.target.checked)}
            className="size-3.5 accent-brand"
          />
          <span className="max-sm:sr-only">Auto-read</span>
        </label>
      </div>
      )}
    </div>
  );
}
