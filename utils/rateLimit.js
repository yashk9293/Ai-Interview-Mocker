import "server-only";
// Kept out of ./actions.js: everything exported there is a public endpoint.
import { sql } from "drizzle-orm";
import { db } from "./db";
import { RATE_LIMITS } from "./interview";

// Records an AI call, or returns an error message if the user is over the
// hourly limit for this kind of call. One round trip: the insert only
// happens when the count of the last hour's calls is under the limit.
export async function checkRateLimit(userId, kind) {
  const { rows } = await db.execute(sql`
    INSERT INTO "aiUsage" ("userId", "kind")
    SELECT ${userId}, ${kind}
    WHERE (
      SELECT count(*) FROM "aiUsage"
      WHERE "userId" = ${userId} AND "kind" = ${kind} AND "createdAt" > now() - interval '1 hour'
    ) < ${RATE_LIMITS[kind]}
    RETURNING "id"`);
  return rows.length ? null : "You've reached the hourly limit, please try again later";
}
