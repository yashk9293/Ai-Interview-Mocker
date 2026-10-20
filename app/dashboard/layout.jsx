import React from "react";
import { getInterviewsForUser, requireUserId } from "@/utils/queries";
import AppShell from "./_components/AppShell";

// Server actions on these pages call Gemini; allow time for a slow response.
export const maxDuration = 60;

async function DashboardLayout({ children }) {
  // The sidebar's "Recent" list. Refreshed by the actions that change interviews.
  const recent = (await getInterviewsForUser(await requireUserId())).slice(0, 4).map((iv) => ({
    mockId: iv.mockId,
    jobPosition: iv.jobPosition,
    answered: iv.answered,
    total: iv.questions.length,
    averageRating: iv.averageRating,
  }));
  return <AppShell recent={recent}>{children}</AppShell>;
}

export default DashboardLayout;
