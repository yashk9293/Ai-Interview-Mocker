import { getFeedbackForUser, getInterviewForUser, requireUserId } from "@/utils/queries";
import { notFound } from "next/navigation";
import IntroScreen from "./_components/IntroScreen";

export const metadata = {
  title: "Interview | AI Interview Mocker",
};

async function Interview({ params }) {
  const { interviewId } = await params;
  const userId = await requireUserId();
  const [interview, items] = await Promise.all([
    getInterviewForUser(interviewId, userId),
    getFeedbackForUser(interviewId, userId),
  ]);
  if (!interview || !items) notFound();
  // Only progress goes to the client, not the model answers.
  const progress = items.map(({ questionIndex, answered, rating }) => ({ questionIndex, answered, rating }));
  return <IntroScreen interview={interview} items={progress} />;
}

export default Interview;
