import { getInterviewForUser, requireUserId } from "@/utils/queries";
import { avatarConfigured } from "@/utils/avatar";
import { notFound } from "next/navigation";
import LiveInterview from "./_components/LiveInterview";

export const metadata = {
  title: "Live interview | AI Interview Mocker",
};

const LiveInterviewPage = async ({ params }) => {
  const { interviewId } = await params;
  const userId = await requireUserId();
  const interview = await getInterviewForUser(interviewId, userId);
  if (!interview || interview.questions.length === 0) notFound();
  return <LiveInterview interview={interview} avatarEnabled={avatarConfigured()} />;
};

export default LiveInterviewPage;
