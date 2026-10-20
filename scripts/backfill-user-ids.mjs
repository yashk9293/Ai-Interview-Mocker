// One-off: fill MockInterview."userId" for rows created before ownership
// moved from email to Clerk user ID. Safe to re-run; only touches rows
// where userId is still null.
//
//   node scripts/backfill-user-ids.mjs           # dry run, changes nothing
//   node scripts/backfill-user-ids.mjs --apply   # write the user IDs
import { createClerkClient } from "@clerk/backend";
import pg from "pg";

try {
  process.loadEnvFile();
} catch {}

const apply = process.argv.includes("--apply");
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

const { rows } = await db.query(
  `SELECT DISTINCT "createdBy" AS email FROM "MockInterview" WHERE "userId" IS NULL`
);
const emails = rows.map((r) => r.email);
console.log(`${emails.length} emails need a user ID`);

// Match against every address on the account, not just the primary one,
// so users who have since changed their primary email are still found.
const idByEmail = new Map();
for (let i = 0; i < emails.length; i += 100) {
  const batch = emails.slice(i, i + 100);
  const { data: users } = await clerk.users.getUserList({ emailAddress: batch, limit: 100 });
  for (const user of users) {
    for (const address of user.emailAddresses) {
      idByEmail.set(address.emailAddress.toLowerCase(), user.id);
    }
  }
}

let matched = 0;
let rowsUpdated = 0;
const missing = [];
for (const email of emails) {
  const userId = idByEmail.get(email.toLowerCase());
  if (!userId) {
    missing.push(email);
    continue;
  }
  matched++;
  if (apply) {
    const res = await db.query(
      `UPDATE "MockInterview" SET "userId" = $1 WHERE "createdBy" = $2 AND "userId" IS NULL`,
      [userId, email]
    );
    rowsUpdated += res.rowCount;
  }
}

console.log(`${matched} emails matched a Clerk user`);
console.log(`${missing.length} emails have no Clerk account (their interviews stay unowned)`);
console.log(apply ? `${rowsUpdated} interviews updated` : "Dry run: nothing written. Re-run with --apply.");
await db.end();
