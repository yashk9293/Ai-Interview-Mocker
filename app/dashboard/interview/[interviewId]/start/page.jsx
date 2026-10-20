import { getFeedbackForUser, getInterviewForUser, requireUserId } from "@/utils/queries";
import { notFound } from "next/navigation";
import InterviewSession from "./_components/InterviewSession";

export const metadata = {
  title: "Interview in progress | AI Interview Mocker",
};

const StartInterview = async ({ params }) => {
  const { interviewId } = await params;
  const userId = await requireUserId();
  const [interview, items] = await Promise.all([
    getInterviewForUser(interviewId, userId),
    getFeedbackForUser(interviewId, userId),
  ]);
  if (!interview || !items || interview.questions.length === 0) notFound();
  // Only progress goes to the client, not the model answers.
  const progress = items.map(({ questionIndex, answered, rating }) => ({ questionIndex, answered, rating }));
  return <InterviewSession interviewData={interview} progress={progress} />;
};

export default StartInterview;
