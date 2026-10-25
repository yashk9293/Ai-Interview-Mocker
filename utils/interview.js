// Plain helpers shared by the server actions and the UI. No server-only
// imports here, so they can be unit tested and used in client components.

export const INTERVIEW_TYPES = {
  technical: "Technical",
  behavioral: "Behavioral",
  "system-design": "System design",
  mixed: "Mixed (technical and behavioral)",
};

export const DIFFICULTIES = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// AI calls allowed per user per hour.
export const RATE_LIMITS = {
  interview: 10,
  answer: 60,
  // Job descriptions read from an uploaded PDF or image.
  read: 20,
  // Live (spoken, two-way) interview sessions, and the avatar that can show them.
  live: 6,
  avatar: 6,
};

// The candidate's side of one question in a live interview, for grading.
// `entries` is the question's transcript in order: [{ who, text }], where
// who is "interviewer" or "candidate". The interviewer's lines before the
// first answer are the question itself and are left out; any after it are
// follow-ups, kept and labelled so the grader sees what was asked.
export function liveAnswerText(entries = []) {
  const turns = [];
  for (const { who, text } of entries) {
    const t = String(text ?? "").trim();
    if (!t) continue;
    if (who === "interviewer" && !turns.some((x) => x.who === "candidate")) continue;
    const last = turns.at(-1);
    if (last?.who === who) last.text += ` ${t}`;
    else turns.push({ who, text: t });
  }
  while (turns.at(-1)?.who === "interviewer") turns.pop();
  if (!turns.some((x) => x.who === "interviewer")) return turns.map((x) => x.text).join(" ");
  return turns.map((x) => (x.who === "interviewer" ? `Interviewer (follow-up): ${x.text}` : `Candidate: ${x.text}`)).join("\n");
}

// Uploads (resume, job description) are read once and never stored. The
// Server Action body limit in next.config.mjs leaves room above this.
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

// The longest job description we keep, typed or read from a file.
export const MAX_JOB_DESC = 6000;

const KIND_NAMES = { pdf: "a PDF", docx: "a Word file (.docx)", image: "an image (PNG, JPG or WebP)" };

// What the uploaded file really is, from its first bytes (`head`, at least
// 12): the name and browser-reported type can't be trusted. A .docx is a zip,
// so for that the name decides between Word and any other zip.
export function sniffUpload(head, name = "") {
  const b = [...(head ?? [])];
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 5) === "%PDF-") return { kind: "pdf", mimeType: "application/pdf" };
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return { kind: "image", mimeType: "image/png" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { kind: "image", mimeType: "image/jpeg" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { kind: "image", mimeType: "image/webp" };
  if (ascii(0, 4) === "PK\x03\x04" && /\.docx$/i.test(name)) return { kind: "docx", mimeType: null };
  return null;
}

// Returns { kind, mimeType } for an acceptable upload, or { error }.
// `allowed` lists the kinds this field takes, e.g. ["pdf", "docx"].
export function checkUpload({ size, head, name }, allowed, label) {
  if (size > MAX_UPLOAD_BYTES) return { error: `Your ${label} must be 2 MB or smaller` };
  const found = sniffUpload(head, name);
  if (!found || !allowed.includes(found.kind)) {
    const list = allowed.map((k) => KIND_NAMES[k]);
    const choices = list.length > 1 ? `${list.slice(0, -1).join(", ")} or ${list.at(-1)}` : list[0];
    return { error: `Your ${label} must be ${choices}` };
  }
  return found;
}

// Questions are stored as jsonb; tolerate anything that isn't a list.
export function parseQuestions(jsonMockResp) {
  return Array.isArray(jsonMockResp) ? jsonMockResp : [];
}

// One item per question, in order, with the matching answer if any.
export function buildFeedbackItems(questions, answers) {
  const byIndex = new Map(answers.map((a) => [a.questionIndex, a]));
  return questions.map((q, index) => {
    const answer = byIndex.get(index);
    return {
      questionIndex: index,
      question: q.question,
      correctAns: q.answer,
      answered: Boolean(answer),
      userAns: answer?.userAns ?? null,
      feedback: answer?.feedback ?? null,
      rating: answer?.rating ?? null,
    };
  });
}

// Average of the given ratings to one decimal place, or null if none.
export function averageRating(ratings) {
  const valid = ratings.filter((r) => typeof r === "number" && !Number.isNaN(r));
  if (valid.length === 0) return null;
  return Number((valid.reduce((sum, r) => sum + r, 0) / valid.length).toFixed(1));
}

// The home screen's figures, all computed from the interview rows as shown.
// `interviews` is newest first, each with { questions, answered, averageRating }.
export function homeSummary(interviews) {
  const scored = interviews.filter((i) => i.averageRating !== null);
  const answered = interviews.reduce((sum, i) => sum + i.answered, 0);
  const asked = interviews.reduce((sum, i) => sum + i.questions.length, 0);
  const weighted = scored.reduce((sum, i) => sum + i.averageRating * i.answered, 0);
  const scoredAnswers = scored.reduce((sum, i) => sum + i.answered, 0);
  const average = scoredAnswers ? Number((weighted / scoredAnswers).toFixed(1)) : null;
  const recent = averageRating(scored.slice(0, 3).map((i) => i.averageRating));
  const earlier = averageRating(scored.slice(3, 6).map((i) => i.averageRating));
  // The change is the difference of the two values as displayed.
  const change = recent !== null && earlier !== null ? Number((recent - earlier).toFixed(1)) : null;

  let finding;
  if (interviews.length === 0) finding = "Start your first mock interview to see your scores here.";
  else if (scored.length === 0) finding = "No answers rated yet. Record an answer to get your first score.";
  else if (change === null) finding = `Your average so far is ${average} /10 across ${scoredAnswers} rated answer${scoredAnswers === 1 ? "" : "s"}.`;
  else if (change === 0) finding = `Your last three interviews average ${recent} /10, level with the three before.`;
  else finding = `Your last three interviews average ${recent} /10, ${change > 0 ? "up" : "down"} ${Math.abs(change)} on the three before.`;

  return { total: interviews.length, answered, asked, average, recent, earlier, change, finding, scoredCount: scored.length };
}
