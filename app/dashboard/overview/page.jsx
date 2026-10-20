import { getInterviewsForUser, getWeakestAnswersForUser, requireUserId } from "@/utils/queries";
import HomeScreen from "../_components/HomeScreen";

export const metadata = {
  title: "Overview | AI Interview Mocker",
};

// Overview: your scores, the score chart and what to practise next.
export default async function Overview() {
  const userId = await requireUserId();
  const [interviews, weakest] = await Promise.all([
    getInterviewsForUser(userId),
    getWeakestAnswersForUser(userId),
  ]);
  return <HomeScreen interviews={interviews} weakest={weakest} />;
}
