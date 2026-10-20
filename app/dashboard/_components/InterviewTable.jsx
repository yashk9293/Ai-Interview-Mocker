"use client";
import { useState } from "react";
import Link from "next/link";
import { CalendarDays, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteInterview } from "@/utils/actions";
import { DIFFICULTIES, INTERVIEW_TYPES } from "@/utils/interview";
import { Panel, PanelHeader, PrimaryButton, Rating, SecondaryButton, TextAction, formatDate } from "@/components/app/ui";

const CAP = 9;

// Every interview, newest first, as a card: the role, its details, progress
// through the questions, the score, and the next thing to do.
function InterviewCard({ iv, onDelete }) {
  const total = iv.questions.length;
  const done = iv.answered >= total;
  const next = iv.answered === 0 ? "Start" : done ? "Retake" : "Continue";

  return (
    <li className="group flex flex-col rounded-xl border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_8px_30px_-12px_rgba(72,69,210,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/dashboard/interview/${iv.mockId}`}
            className="line-clamp-1 text-base font-semibold text-brand underline-offset-4 hover:underline"
          >
            {iv.jobPosition}
          </Link>
          <p className="mt-1 text-[13px] text-faint">
            {INTERVIEW_TYPES[iv.interviewType]} · {DIFFICULTIES[iv.difficulty]} · {iv.jobExperience} yrs
          </p>
        </div>
        <button
          type="button"
          aria-label={`Delete ${iv.jobPosition} interview`}
          className="-mr-1.5 -mt-1 rounded-md p-1.5 text-faint transition-colors hover:bg-negative-tint hover:text-negative"
          onClick={() => onDelete(iv)}
        >
          <Trash2 className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <CalendarDays className="size-3.5" aria-hidden="true" /> {formatDate(iv.createdAt)}
      </p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="flex-1">
          <p className="text-[13px] text-muted-foreground">
            <span className="num font-medium text-ink">{iv.answered}</span> of <span className="num">{total}</span> answered
          </p>
          <div className="mt-1.5 h-1.5 rounded-full bg-raised" aria-hidden="true">
            <div className="h-1.5 rounded-full bg-brand" style={{ width: `${(iv.answered / total) * 100}%` }} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-faint">Score</p>
          <Rating value={iv.averageRating} size={18} />
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4">
        {iv.answered > 0 && (
          <SecondaryButton href={`/dashboard/interview/${iv.mockId}/feedback`} className="flex-1">
            Feedback
          </SecondaryButton>
        )}
        <PrimaryButton href={`/dashboard/interview/${iv.mockId}/start`} className="flex-1">
          {next}
        </PrimaryButton>
      </div>
    </li>
  );
}

export default function InterviewTable({ initialInterviews }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [showAll, setShowAll] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const shown = showAll ? interviews : interviews.slice(0, CAP);

  const onDelete = async () => {
    setDeleting(true);
    const resp = await deleteInterview(confirming.mockId);
    setDeleting(false);
    if (resp.error) return toast(resp.error);
    setInterviews((list) => list.filter((i) => i.mockId !== confirming.mockId));
    toast("Interview deleted");
    setConfirming(null);
  };

  return (
    <Panel className="col-span-12">
      <PanelHeader
        title="Your interviews"
        meta={interviews.length}
        action={interviews.length > CAP && (
          <TextAction type="button" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show fewer" : `Show all ${interviews.length}`}
          </TextAction>
        )}
      />
      {interviews.length === 0 ? (
        <p className="rounded-md border border-dashed border-control px-4 py-3 text-[14px] text-muted-foreground">
          No interviews yet. Your first one appears here as soon as you create it.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((iv) => (
            <InterviewCard key={iv.mockId} iv={iv} onDelete={setConfirming} />
          ))}
        </ul>
      )}

      <Dialog open={Boolean(confirming)} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent className="border-0 bg-white sm:rounded-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[20px] font-medium text-ink">Delete this interview?</DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">
              &quot;{confirming?.jobPosition}&quot;, its {confirming?.answered ?? 0} recorded answer{confirming?.answered === 1 ? "" : "s"} and all feedback will be deleted for good.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <SecondaryButton type="button" onClick={() => setConfirming(null)}>Cancel</SecondaryButton>
            <button
              type="button"
              disabled={deleting}
              onClick={onDelete}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-negative px-4 text-[14px] font-medium text-white transition-transform active:scale-[0.97] disabled:opacity-60"
            >
              {deleting && <LoaderCircle className="size-4 animate-spin" />} Delete interview
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
