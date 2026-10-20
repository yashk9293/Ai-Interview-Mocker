"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createInterview } from "@/utils/actions";
import { DIFFICULTIES, INTERVIEW_TYPES } from "@/utils/interview";
import { PrimaryButton, SecondaryButton } from "@/components/app/ui";

const fieldClass =
  "mt-2 h-10 w-full rounded-md border border-control bg-bg px-3 text-[15px] text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand";

function Field({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-[14px] font-medium text-ink">{label}</label>
      {hint && <span className="ml-2 text-[12px] text-faint">{hint}</span>}
      {children}
    </div>
  );
}

// "New interview": the app's most frequent job, one click from every screen.
// Links from the landing page (?role=&type=&difficulty=) open it prefilled.
function AddNewInterview({ label = "New interview" }) {
  const params = useSearchParams();
  const prefill = params.get("role");
  const [openDialog, setOpenDialog] = useState(Boolean(prefill));
  const [jobPosition, setJobPosition] = useState(prefill ?? "");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [interviewType, setInterviewType] = useState(
    params.get("type") in INTERVIEW_TYPES ? params.get("type") : "technical"
  );
  const [difficulty, setDifficulty] = useState(
    params.get("difficulty") in DIFFICULTIES ? params.get("difficulty") : "medium"
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const resp = await createInterview({ jobPosition, jobDesc, jobExperience, interviewType, difficulty });
    if (resp.error) {
      toast(resp.error);
      setLoading(false);
      return;
    }
    setOpenDialog(false);
    router.push("/dashboard/interview/" + resp.mockId);
  };

  return (
    <>
      <PrimaryButton type="button" onClick={() => setOpenDialog(true)}>
        <Plus className="size-4" aria-hidden="true" /> {label}
      </PrimaryButton>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl gap-0 border-0 bg-surface p-6 sm:rounded-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-[24px] font-medium text-ink">New interview</DialogTitle>
            <DialogDescription className="text-[14px] text-muted-foreground">
              Five questions, written for this role, your stack and your years of experience.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <Field id="jobPosition" label="Job role">
              <input
                id="jobPosition"
                className={fieldClass}
                placeholder="Frontend developer"
                maxLength={200}
                required
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
              />
            </Field>
            <Field id="jobDesc" label="Job description or tech stack" hint="in short">
              <textarea
                id="jobDesc"
                className={`${fieldClass} h-24 resize-none py-2`}
                placeholder="React, TypeScript, Next.js, REST APIs"
                maxLength={2000}
                required
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="jobExperience" label="Years of experience">
                <input
                  id="jobExperience"
                  className={`${fieldClass} num`}
                  placeholder="3"
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={jobExperience}
                  onChange={(e) => setJobExperience(e.target.value)}
                />
              </Field>
              <Field id="interviewType" label="Type">
                <select id="interviewType" className={fieldClass} value={interviewType} onChange={(e) => setInterviewType(e.target.value)}>
                  {Object.entries(INTERVIEW_TYPES).map(([value, text]) => (
                    <option key={value} value={value}>{value === "mixed" ? "Mixed" : text}</option>
                  ))}
                </select>
              </Field>
              <Field id="difficulty" label="Difficulty">
                <select id="difficulty" className={fieldClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {Object.entries(DIFFICULTIES).map(([value, text]) => (
                    <option key={value} value={value}>{text}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setOpenDialog(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={loading}>
                {loading ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Writing your questions</> : "Create interview"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddNewInterview;
