import { getFeedbackForUser, getInterviewForUser, requireUserId } from '@/utils/queries';
import { notFound } from 'next/navigation';
import FeedbackScreen from './FeedbackScreen';

export const metadata = {
  title: "Interview feedback | AI Interview Mocker",
};

const Feedback = async ({ params }) => {
  const { interviewId } = await params;
  const userId = await requireUserId();
  const [interview, items] = await Promise.all([
    getInterviewForUser(interviewId, userId),
    getFeedbackForUser(interviewId, userId),
  ]);
  if (!interview || !items) notFound();
  return <FeedbackScreen interview={interview} items={items} />;
}

export default Feedback;
