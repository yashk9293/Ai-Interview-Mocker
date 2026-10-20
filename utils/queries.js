import "server-only";
// Reads used by Server Components (pages fetch on the server, no extra
// browser round trip) and by the Server Actions in ./actions.js.
import { auth } from "@clerk/nextjs/server";
import { and, asc, avg, count, desc, eq, isNotNull } from "drizzle-orm";
import { cache } from "react";
import { db } from "./db";
import { MockInterview, UserAnswer } from "./schema";
import { buildFeedbackItems, parseQuestions } from "./interview";

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

// Cached per request, so a page and its metadata share one query.
export const findOwnedInterview = cache(async (mockId, userId) => {
  const [interview] = await db
    .select()
    .from(MockInterview)
    .where(and(eq(MockInterview.mockId, String(mockId)), eq(MockInterview.userId, userId)));
  return interview;
});

export function toClientInterview(interview) {
  return {
    mockId: interview.mockId,
    jobPosition: interview.jobPosition,
    jobDesc: interview.jobDesc,
    jobExperience: interview.jobExperience,
    interviewType: interview.interviewType,
    difficulty: interview.difficulty,
    createdAt: interview.createdAt.toISOString(),
    // The model answers stay on the server until the feedback page.
    questions: parseQuestions(interview.jsonMockResp).map((q) => ({
      question: q.question,
    })),
  };
}

// Each interview with how many questions were answered and the average
// rating, for the dashboard's progress view. One query.
export async function getInterviewsForUser(userId) {
  const rows = await db
    .select({
      interview: MockInterview,
      answered: count(UserAnswer.id),
      averageRating: avg(UserAnswer.rating),
    })
    .from(MockInterview)
    .leftJoin(UserAnswer, eq(UserAnswer.mockIdRef, MockInterview.mockId))
    .where(eq(MockInterview.userId, userId))
    .groupBy(MockInterview.id)
    .orderBy(desc(MockInterview.createdAt), desc(MockInterview.id));
  return rows.map(({ interview, answered, averageRating }) => ({
    ...toClientInterview(interview),
    answered,
    averageRating: averageRating === null ? null : Number(Number(averageRating).toFixed(1)),
  }));
}

// The user's lowest-rated answers across all interviews: what to practise next.
export async function getWeakestAnswersForUser(userId, limit = 4) {
  return db
    .select({
      mockId: UserAnswer.mockIdRef,
      questionIndex: UserAnswer.questionIndex,
      question: UserAnswer.question,
      rating: UserAnswer.rating,
      jobPosition: MockInterview.jobPosition,
    })
    .from(UserAnswer)
    .innerJoin(MockInterview, eq(UserAnswer.mockIdRef, MockInterview.mockId))
    .where(and(eq(MockInterview.userId, userId), isNotNull(UserAnswer.rating)))
    .orderBy(asc(UserAnswer.rating), desc(UserAnswer.createdAt))
    .limit(limit);
}

export async function getInterviewForUser(mockId, userId) {
  const interview = await findOwnedInterview(mockId, userId);
  return interview ? toClientInterview(interview) : null;
}

// Every question in the interview, with the user's answer and feedback when
// they recorded one. The ownership check and the answers load in parallel.
export async function getFeedbackForUser(mockId, userId) {
  const [interview, answers] = await Promise.all([
    findOwnedInterview(mockId, userId),
    db.select().from(UserAnswer).where(eq(UserAnswer.mockIdRef, String(mockId))),
  ]);
  if (!interview) return null;
  return buildFeedbackItems(parseQuestions(interview.jsonMockResp), answers);
}
