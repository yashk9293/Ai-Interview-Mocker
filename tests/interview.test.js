import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  INTERVIEW_TYPES,
  RATE_LIMITS,
  averageRating,
  buildFeedbackItems,
  parseQuestions,
} from "../utils/interview";

describe("parseQuestions", () => {
  it("returns the list when given an array", () => {
    const questions = [{ question: "Q1", answer: "A1" }];
    expect(parseQuestions(questions)).toBe(questions);
  });

  it("returns an empty list for anything else", () => {
    expect(parseQuestions(null)).toEqual([]);
    expect(parseQuestions({ question: "Q1" })).toEqual([]);
    expect(parseQuestions('[{"question":"Q1"}]')).toEqual([]);
  });
});

describe("buildFeedbackItems", () => {
  const questions = [
    { question: "Q1", answer: "A1" },
    { question: "Q2", answer: "A2" },
    { question: "Q3", answer: "A3" },
  ];

  it("returns one item per question, in order, including unanswered ones", () => {
    const answers = [
      { questionIndex: 2, userAns: "mine 3", feedback: "f3", rating: 6 },
      { questionIndex: 0, userAns: "mine 1", feedback: "f1", rating: 8 },
    ];
    expect(buildFeedbackItems(questions, answers)).toEqual([
      { questionIndex: 0, question: "Q1", correctAns: "A1", answered: true, userAns: "mine 1", feedback: "f1", rating: 8 },
      { questionIndex: 1, question: "Q2", correctAns: "A2", answered: false, userAns: null, feedback: null, rating: null },
      { questionIndex: 2, question: "Q3", correctAns: "A3", answered: true, userAns: "mine 3", feedback: "f3", rating: 6 },
    ]);
  });

  it("ignores answers whose question no longer exists", () => {
    const items = buildFeedbackItems(questions, [{ questionIndex: 7, userAns: "x", rating: 9 }]);
    expect(items.every((item) => !item.answered)).toBe(true);
  });
});

describe("averageRating", () => {
  it("averages to one decimal place", () => {
    expect(averageRating([7, 8, 8])).toBe(7.7);
    expect(averageRating([10])).toBe(10);
  });

  it("skips missing ratings", () => {
    expect(averageRating([6, null, undefined, NaN, 8])).toBe(7);
  });

  it("returns null when there is nothing to average", () => {
    expect(averageRating([])).toBeNull();
    expect(averageRating([null])).toBeNull();
  });
});

describe("options", () => {
  it("defines the defaults the database falls back to", () => {
    expect(INTERVIEW_TYPES).toHaveProperty("technical");
    expect(DIFFICULTIES).toHaveProperty("medium");
  });

  it("has a limit for every kind of AI call", () => {
    expect(RATE_LIMITS.interview).toBeGreaterThan(0);
    expect(RATE_LIMITS.answer).toBeGreaterThan(0);
  });
});
