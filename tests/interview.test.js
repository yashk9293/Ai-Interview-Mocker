import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  INTERVIEW_TYPES,
  MAX_UPLOAD_BYTES,
  RATE_LIMITS,
  averageRating,
  buildFeedbackItems,
  parseQuestions,
  checkUpload,
  liveAnswerText,
  sniffUpload,
} from "../utils/interview";

describe("parseQuestions", () => {
  it("returns the list when given an array", () => {
    const questions = [{ question: "Q1", answer: "A1" }];
    expect(parseQuestions(questions)).toBe(questions);
  });

  it("returns an empty list for anything else", () => {
    expect(parseQuestions(null)).toEqual([]);
    expect(parseQuestions({ question: "Q1" })).toEqual([]);
    expect(parseQuestions('[{"question":"Q1"}]')).toEqual([]);
  });
});

describe("buildFeedbackItems", () => {
  const questions = [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    { question: "Q3", answer: "A3" },
  ];

  it("returns one item per question, in order, including unanswered ones", () => {
    const answers = [
      { questionIndex: 2, userAns: "mine 3", feedback: "f3", rating: 6 },
      { questionIndex: 0, userAns: "mine 1", feedback: "f1", rating: 8 },
    ];
    expect(buildFeedbackItems(questions, answers)).toEqual([
      { questionIndex: 0, question: "Q1", correctAns: "A1", answered: true, userAns: "mine 1", feedback: "f1", rating: 8 },
      { questionIndex: 1, question: "Q2", correctAns: "A2", answered: false, userAns: null, feedback: null, rating: null },
      { questionIndex: 2, question: "Q3", correctAns: "A3", answered: true, userAns: "mine 3", feedback: "f3", rating: 6 },
    ]);
  });

  it("ignores answers whose question no longer exists", () => {
    const items = buildFeedbackItems(questions, [{ questionIndex: 7, userAns: "x", rating: 9 }]);
    expect(items.every((item) => !item.answered)).toBe(true);
  });
});

describe("averageRating", () => {
  it("averages to one decimal place", () => {
    expect(averageRating([7, 8, 8])).toBe(7.7);
    expect(averageRating([10])).toBe(10);
  });

  it("skips missing ratings", () => {
    expect(averageRating([6, null, undefined, NaN, 8])).toBe(7);
  });

  it("returns null when there is nothing to average", () => {
    expect(averageRating([])).toBeNull();
    expect(averageRating([null])).toBeNull();
  });
});

describe("options", () => {
  it("defines the defaults the database falls back to", () => {
    expect(INTERVIEW_TYPES).toHaveProperty("technical");
    expect(DIFFICULTIES).toHaveProperty("medium");
  });

  it("has a limit for every kind of AI call", () => {
    expect(RATE_LIMITS.interview).toBeGreaterThan(0);
    expect(RATE_LIMITS.answer).toBeGreaterThan(0);
  });
});

describe("sniffUpload", () => {
  const bytes = (...parts) => parts.flatMap((p) => (typeof p === "string" ? [...Buffer.from(p, "latin1")] : p));

  it("recognises files by their first bytes", () => {
    expect(sniffUpload(bytes("%PDF-1.7"))).toEqual({ kind: "pdf", mimeType: "application/pdf" });
    expect(sniffUpload(bytes([0x89], "PNG\r\n"))).toEqual({ kind: "image", mimeType: "image/png" });
    expect(sniffUpload(bytes([0xff, 0xd8, 0xff, 0xe0]))).toEqual({ kind: "image", mimeType: "image/jpeg" });
    expect(sniffUpload(bytes("RIFF", [1, 2, 3, 4], "WEBPVP8 "))).toEqual({ kind: "image", mimeType: "image/webp" });
  });

  it("takes a zip as Word only when it is named .docx", () => {
    expect(sniffUpload(bytes("PK\x03\x04"), "resume.DOCX")).toEqual({ kind: "docx", mimeType: null });
    expect(sniffUpload(bytes("PK\x03\x04"), "resume.zip")).toBeNull();
  });

  it("ignores the file name for everything else", () => {
    expect(sniffUpload(bytes("GIF89a"), "resume.pdf")).toBeNull();
    expect(sniffUpload([])).toBeNull();
  });
});

describe("checkUpload", () => {
  const pdf = [...Buffer.from("%PDF-1.7")];
  const png = [0x89, ...Buffer.from("PNG")];

  it("accepts an allowed kind within the size limit", () => {
    expect(checkUpload({ size: MAX_UPLOAD_BYTES, head: pdf }, ["pdf", "docx"], "resume")).toMatchObject({ kind: "pdf" });
  });

  it("rejects a file over the size limit", () => {
    expect(checkUpload({ size: MAX_UPLOAD_BYTES + 1, head: pdf }, ["pdf"], "resume").error).toMatch(/2 MB/);
  });

  it("rejects a kind this field doesn't take, naming the ones it does", () => {
    expect(checkUpload({ size: 1000, head: png }, ["pdf", "docx"], "resume").error)
      .toBe("Your resume must be a PDF or a Word file (.docx)");
  });
});

describe("liveAnswerText", () => {
  it("drops the question itself and joins the candidate's words", () => {
    expect(liveAnswerText([
      { who: "interviewer", text: "What is a closure?" },
      { who: "candidate", text: "A function that" },
      { who: "candidate", text: "remembers its scope." },
    ])).toBe("A function that remembers its scope.");
  });

  it("labels follow-ups and drops a closing remark with no answer after it", () => {
    expect(liveAnswerText([
      { who: "interviewer", text: "Why Redis?" },
      { who: "candidate", text: "It's fast." },
      { who: "interviewer", text: "Why not Postgres?" },
      { who: "candidate", text: "Latency." },
      { who: "interviewer", text: "Thanks, moving on." },
    ])).toBe("Candidate: It's fast.\nInterviewer (follow-up): Why not Postgres?\nCandidate: Latency.");
  });

  it("returns empty text when the candidate said nothing", () => {
    expect(liveAnswerText([{ who: "interviewer", text: "Q?" }, { who: "candidate", text: "  " }])).toBe("");
    expect(liveAnswerText()).toBe("");
  });
});
