"use client";
import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUp, LoaderCircle, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createInterview, readJobDescription } from "@/utils/actions";
import { DIFFICULTIES, INTERVIEW_TYPES, MAX_JOB_DESC, MAX_UPLOAD_BYTES } from "@/utils/interview";
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
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [readingJobDesc, setReadingJobDesc] = useState(false);
  const jobDescFile = useRef(null);
  const router = useRouter();

  // Size is checked here for a fast answer; the server checks it again.
  const onResumeChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_UPLOAD_BYTES) {
      toast("Your resume must be 2 MB or smaller");
      e.target.value = "";
      setResume(null);
      return;
    }
    setResume(file);
  };

  // The posting's text lands in the textarea, to check and edit before creating.
  const onJobDescFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast("Your job description must be 2 MB or smaller");
      return;
    }
    setReadingJobDesc(true);
    const formData = new FormData();
    formData.set("file", file);
    const resp = await readJobDescription(formData);
    setReadingJobDesc(false);
    if (resp.error) {
      toast(resp.error);
      return;
    }
    setJobDesc(resp.text);
    toast(resp.truncated
      ? "Job description added. It was long, so only the first part was kept; check it below."
      : "Job description added. Check it below and fix anything that was misread.");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("jobPosition", jobPosition);
    formData.set("jobDesc", jobDesc);
    formData.set("jobExperience", jobExperience);
    formData.set("interviewType", interviewType);
    formData.set("difficulty", difficulty);
    if (resume) formData.set("resume", resume);
    const resp = await createInterview(formData);
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
                className={`${fieldClass} h-24 resize-y py-2`}
                placeholder="React, TypeScript, Next.js, REST APIs"
                maxLength={MAX_JOB_DESC}
                required
                disabled={readingJobDesc}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
              <input
                ref={jobDescFile}
                type="file"
                accept="application/pdf,.pdf,image/png,image/jpeg,image/webp,.docx"
                className="hidden"
                onChange={onJobDescFile}
              />
              <button
                type="button"
                onClick={() => jobDescFile.current?.click()}
                disabled={readingJobDesc || loading}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-brand/50 bg-brand-tint px-3 text-[14px] font-medium text-brand transition-colors hover:border-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-60"
              >
                {readingJobDesc
                  ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Reading the job description</>
                  : <>
                      <FileUp className="size-4" strokeWidth={1.75} aria-hidden="true" /> Or upload the job posting
                      <span className="font-normal text-muted-foreground max-sm:hidden">PDF, screenshot or Word</span>
                    </>}
              </button>
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
            <Field id="resume" label="Resume" hint="optional, PDF or Word, up to 2 MB">
              <input
                id="resume"
                type="file"
                accept="application/pdf,.pdf,.docx"
                className={`${fieldClass} py-[7px] text-[14px] file:mr-3 file:border-0 file:bg-transparent file:text-[14px] file:font-medium file:text-ink`}
                onChange={onResumeChange}
              />
              <p className="mt-1 text-[12px] text-faint">
                Adds questions about your own projects. Read once to write the questions, never stored.
              </p>
            </Field>
            <div className="mt-2 flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setOpenDialog(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={loading || readingJobDesc}>
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
