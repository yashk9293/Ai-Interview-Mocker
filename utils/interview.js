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
};

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
