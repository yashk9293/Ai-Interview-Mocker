"use client";
import React, { useState } from "react";
import QuestionsSection from "./QuestionsSection";
import RecordAnswerSection from "./RecordAnswerSection";
import { DIFFICULTIES, INTERVIEW_TYPES } from "@/utils/interview";
import { SecondaryButton, TitleRow } from "@/components/app/ui";

// The session. The question: "What am I being asked, and is my answer being
// heard?" Grid 7 + 5: the question on the left, the answer on the right.
// `progress` is [{ questionIndex, answered, rating }] from the server.
const InterviewSession = ({ interviewData, progress = [] }) => {
  const questions = interviewData.questions;
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(() => {
    const firstOpen = progress.find((p) => !p.answered);
    return firstOpen ? firstOpen.questionIndex : 0;
  });
  const [ratings, setRatings] = useState(() =>
    Object.fromEntries(progress.filter((p) => p.answered).map((p) => [p.questionIndex, p.rating]))
  );
  const answeredCount = Object.keys(ratings).length;

  return (
    <div className="mx-auto max-w-7xl">
      <TitleRow
        title={interviewData.jobPosition}
        line={`Question ${activeQuestionIndex + 1} of ${questions.length} · ${answeredCount} answered · ${INTERVIEW_TYPES[interviewData.interviewType]} · ${DIFFICULTIES[interviewData.difficulty]}`}
        actions={
          <SecondaryButton href={`/dashboard/interview/${interviewData.mockId}/feedback`}>
            {answeredCount === questions.length ? "See your feedback" : "End interview"}
          </SecondaryButton>
        }
      />
      <div className="grid grid-cols-12 gap-4">
        <QuestionsSection
          mockInterviewQuestion={questions}
          activeQuestionIndex={activeQuestionIndex}
          setActiveQuestionIndex={setActiveQuestionIndex}
          ratings={ratings}
        />
        <RecordAnswerSection
          mockInterviewQuestion={questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          onSaved={(index, rating) => setRatings((r) => ({ ...r, [index]: rating }))}
        />
      </div>
    </div>
  );
};

export default InterviewSession;
