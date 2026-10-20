import { getInterviewsForUser, requireUserId } from "@/utils/queries";
import { TitleRow } from "@/components/app/ui";
import InterviewTable from "./_components/InterviewTable";

export const metadata = {
  title: "Dashboard | AI Interview Mocker",
};

// Dashboard: every interview as a card, to start, continue or review.
export default async function Dashboard() {
  const interviews = await getInterviewsForUser(await requireUserId());
  const inProgress = interviews.filter((i) => i.answered > 0 && i.answered < i.questions.length).length;
  const line = interviews.length === 0
    ? "Create your first mock interview to get started."
    : `${interviews.length} interview${interviews.length === 1 ? "" : "s"}${inProgress ? `, ${inProgress} in progress` : ""}. Start a new one, continue where you left off, or read your feedback.`;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4">
      <div className="col-span-12">
        {/* "New interview" lives in the top bar on every app page. */}
        <TitleRow title="Dashboard" line={line} />
      </div>
      <InterviewTable initialInterviews={interviews} />
    </div>
  );
}
