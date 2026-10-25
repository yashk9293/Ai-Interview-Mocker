"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import QuestionsSection from "./QuestionsSection";
import RecordAnswerSection from "./RecordAnswerSection";
import Interviewer from "./Interviewer";
import useInterviewerVoice from "@/utils/useInterviewerVoice";
import { DIFFICULTIES, INTERVIEW_TYPES } from "@/utils/interview";
import { SecondaryButton, TitleRow } from "@/components/app/ui";

const AUTO_READ_KEY = "interviewer-auto-read";

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

  const voice = useInterviewerVoice();
  const { speak, stop } = voice;
  // null until the saved choice is read after mount, so nothing is spoken
  // before we know whether the user turned automatic reading off.
  const [autoRead, setAutoRead] = useState(null);
  const [recording, setRecording] = useState(false);
  const recordingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      let saved = null;
      try { saved = localStorage.getItem(AUTO_READ_KEY); } catch {}
      setAutoRead(saved !== "off");
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // The interviewer asks each question as it opens.
  useEffect(() => {
    if (!autoRead) {
      stop();
      return;
    }
    if (!recordingRef.current) speak(questions[activeQuestionIndex]?.question);
  }, [activeQuestionIndex, autoRead, questions, speak, stop]);

  const changeAutoRead = (on) => {
    setAutoRead(on);
    if (!on) stop();
    try { localStorage.setItem(AUTO_READ_KEY, on ? "on" : "off"); } catch {}
  };

  // The interviewer goes quiet the moment the candidate starts answering.
  const onRecordingChange = useCallback((isRecording) => {
    recordingRef.current = isRecording;
    setRecording(isRecording);
    if (isRecording) stop();
  }, [stop]);

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
          interviewer={
            <Interviewer
              voice={voice}
              questionNumber={activeQuestionIndex + 1}
              listening={recording}
              autoRead={autoRead !== false}
              onAutoReadChange={changeAutoRead}
              onPlay={() => speak(questions[activeQuestionIndex]?.question)}
            />
          }
        />
        <RecordAnswerSection
          mockInterviewQuestion={questions}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
          onSaved={(index, rating) => setRatings((r) => ({ ...r, [index]: rating }))}
          onRecordingChange={onRecordingChange}
        />
      </div>
    </div>
  );
};

export default InterviewSession;
