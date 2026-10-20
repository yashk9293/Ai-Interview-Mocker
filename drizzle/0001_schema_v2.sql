-- Schema v2. Hand-ordered so existing data is converted, not lost:
-- types are changed with USING, questionIndex is backfilled before it
-- becomes NOT NULL, duplicate answers are removed before the unique
-- constraint, and mockId is made unique before the foreign key uses it.

CREATE TABLE "aiUsage" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "aiUsage_userId_createdAt_idx" ON "aiUsage" USING btree ("userId","createdAt");
--> statement-breakpoint

-- MockInterview: questions text -> jsonb, "DD-MM-YYYY" text -> timestamptz
ALTER TABLE "MockInterview" ALTER COLUMN "jsonMockResp" SET DATA TYPE jsonb USING "jsonMockResp"::jsonb;
--> statement-breakpoint
ALTER TABLE "MockInterview" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone
	USING COALESCE(to_timestamp("createdAt", 'DD-MM-YYYY'), now());
--> statement-breakpoint
ALTER TABLE "MockInterview" ALTER COLUMN "createdAt" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "MockInterview" ALTER COLUMN "createdAt" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "MockInterview" ADD COLUMN "userId" varchar;
--> statement-breakpoint
ALTER TABLE "MockInterview" ADD COLUMN "interviewType" varchar DEFAULT 'technical' NOT NULL;
--> statement-breakpoint
ALTER TABLE "MockInterview" ADD COLUMN "difficulty" varchar DEFAULT 'medium' NOT NULL;
--> statement-breakpoint
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_mockId_unique" UNIQUE("mockId");
--> statement-breakpoint
CREATE INDEX "MockInterview_userId_idx" ON "MockInterview" USING btree ("userId");
--> statement-breakpoint

-- userAnswer: rating text ("7" or "7/10") -> integer, dates -> timestamptz
ALTER TABLE "userAnswer" ALTER COLUMN "rating" SET DATA TYPE integer
	USING NULLIF(substring("rating" from '\d+'), '')::integer;
--> statement-breakpoint
ALTER TABLE "userAnswer" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone
	USING COALESCE(to_timestamp("createdAt", 'DD-MM-YYYY'), now());
--> statement-breakpoint
ALTER TABLE "userAnswer" ALTER COLUMN "createdAt" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "userAnswer" ALTER COLUMN "createdAt" SET NOT NULL;
--> statement-breakpoint

-- questionIndex: the answer's position in the interview's question list
ALTER TABLE "userAnswer" ADD COLUMN "questionIndex" integer;
--> statement-breakpoint
UPDATE "userAnswer" a SET "questionIndex" = (
	SELECT min(q.ord) - 1
	FROM "MockInterview" m, jsonb_array_elements(m."jsonMockResp") WITH ORDINALITY AS q(item, ord)
	WHERE m."mockId" = a."mockId" AND q.item->>'question' = a."question"
);
--> statement-breakpoint
-- Answers that can't be matched to a question can't be shown; drop them.
DELETE FROM "userAnswer" WHERE "questionIndex" IS NULL;
--> statement-breakpoint
-- Retakes used to add duplicate rows; keep only the latest per question.
DELETE FROM "userAnswer" a USING "userAnswer" b
	WHERE a."mockId" = b."mockId" AND a."questionIndex" = b."questionIndex" AND a."id" < b."id";
--> statement-breakpoint
ALTER TABLE "userAnswer" ALTER COLUMN "questionIndex" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "userAnswer" ADD CONSTRAINT "userAnswer_mockId_questionIndex_unique" UNIQUE("mockId","questionIndex");
--> statement-breakpoint
-- Orphaned answers would block the foreign key.
DELETE FROM "userAnswer" a WHERE NOT EXISTS (SELECT 1 FROM "MockInterview" m WHERE m."mockId" = a."mockId");
--> statement-breakpoint
ALTER TABLE "userAnswer" ADD CONSTRAINT "userAnswer_mockId_MockInterview_mockId_fk" FOREIGN KEY ("mockId") REFERENCES "public"."MockInterview"("mockId") ON DELETE cascade ON UPDATE no action;
