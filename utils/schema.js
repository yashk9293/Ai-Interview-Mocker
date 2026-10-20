import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const MockInterview = pgTable(
  "MockInterview",
  {
    id: serial("id").primaryKey(),
    mockId: varchar("mockId").notNull().unique(),
    // Clerk user ID; ownership is checked against this. Null only for
    // legacy rows whose Clerk account no longer exists.
    userId: varchar("userId"),
    // Email at creation time, kept for reference.
    createdBy: varchar("createdBy").notNull(),
    jobPosition: varchar("jobPosition").notNull(),
    jobDesc: varchar("jobDesc").notNull(),
    jobExperience: varchar("jobExperience").notNull(),
    interviewType: varchar("interviewType").notNull().default("technical"),
    difficulty: varchar("difficulty").notNull().default("medium"),
    // [{ question, answer }]
    jsonMockResp: jsonb("jsonMockResp").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("MockInterview_userId_idx").on(t.userId)]
);

export const UserAnswer = pgTable(
  "userAnswer",
  {
    id: serial("id").primaryKey(),
    mockIdRef: varchar("mockId")
      .notNull()
      .references(() => MockInterview.mockId, { onDelete: "cascade" }),
    questionIndex: integer("questionIndex").notNull(),
    question: varchar("question").notNull(),
    correctAns: text("correctAns"),
    userAns: text("userAns"),
    feedback: text("feedback"),
    rating: integer("rating"),
    userEmail: varchar("userEmail"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("userAnswer_mockId_questionIndex_unique").on(t.mockIdRef, t.questionIndex)]
);

// One row per AI call, used for per-user rate limiting.
export const AiUsage = pgTable(
  "aiUsage",
  {
    id: serial("id").primaryKey(),
    userId: varchar("userId").notNull(),
    kind: varchar("kind").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("aiUsage_userId_createdAt_idx").on(t.userId, t.createdAt)]
);
