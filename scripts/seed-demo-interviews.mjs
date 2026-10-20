// Adds sample interviews to ONE account so the dashboard has history to show.
// Every sample has a mockId starting with "demo-", so they can be removed
// without touching anything else.
//
//   node scripts/seed-demo-interviews.mjs <clerkUserId>            # add
//   node scripts/seed-demo-interviews.mjs <clerkUserId> --remove   # remove
import pg from "pg";

try {
  process.loadEnvFile();
} catch {}

const [userId, flag] = process.argv.slice(2);
if (!userId?.startsWith("user_")) {
  console.error("Usage: node scripts/seed-demo-interviews.mjs <clerkUserId> [--remove]");
  process.exit(1);
}

// [question, model answer, your answer, feedback, rating]
const INTERVIEWS = [
  {
    role: "Frontend developer", type: "technical", difficulty: "easy", years: "2", date: "2025-10-28",
    desc: "HTML, CSS, JavaScript, React basics, responsive layouts.",
    qa: [
      ["What is the difference between let, const and var?", "var is function-scoped and hoisted; let and const are block-scoped. const can't be reassigned, but objects it points to can still change.", "var is old and let and const are new, you should use const mostly.", "Correct direction but too thin. Explain scope (function vs block), hoisting, and that const prevents reassignment, not mutation.", 4],
      ["How does the CSS box model work?", "Every element is a box: content, padding, border and margin. box-sizing: border-box makes width include padding and border.", "There is padding and margin around the content and also border.", "You named the parts but not how width is calculated. Mention box-sizing and why border-box is the common default.", 4],
      ["What is the virtual DOM in React?", "A lightweight copy of the UI in memory. React compares the new tree with the previous one and updates only the DOM nodes that changed.", "React keeps a copy of the DOM and updates it fast.", "Add the diffing step: React compares trees and applies only the differences, which avoids expensive full re-renders.", 5],
      ["How would you make a page responsive?", "Fluid layouts with flexbox or grid, relative units, media queries at content breakpoints, responsive images, and testing on real devices.", "I would use media queries for mobile and desktop.", "Media queries are one tool. Mention flexbox/grid, relative units and mobile-first thinking for a stronger answer.", 4],
      ["What happens when you type a URL and press enter?", "DNS lookup, TCP and TLS handshake, HTTP request, server response, then the browser parses HTML, loads CSS and JS, builds the render tree and paints.", "The browser finds the server and downloads the page and shows it.", "Walk through the steps in order: DNS, connection, request, response, parsing and rendering. Structure matters here.", 3],
    ],
  },
  {
    role: "React developer", type: "technical", difficulty: "medium", years: "2", date: "2025-12-15",
    desc: "React, hooks, state management, REST APIs.",
    qa: [
      ["When would you use useMemo or useCallback?", "To keep expensive calculations or callback identities stable between renders, usually when passing them to memoised children or effect dependencies. Not by default.", "useMemo saves a value and useCallback saves a function so they don't get created again every render.", "Good definitions. Add when it's worth it (expensive work, memoised children) and that overusing them adds cost.", 6],
      ["How do you manage state that many components need?", "Lift state to the closest common parent, use context for rarely-changing values, and a store like Zustand or Redux for complex shared state.", "I use context or Redux when props drilling gets too much.", "Mention lifting state first, and that context re-renders all consumers, so split it by how often it changes.", 5],
      ["What causes an infinite loop in useEffect?", "Setting state inside an effect whose dependencies change on every render, such as a new object or function created each render.", "If you set state in useEffect without a dependency array it keeps running.", "Right. Also explain unstable dependencies (objects, functions) and how to fix them with memoisation or moving them out.", 6],
      ["How do you fetch data in a React app?", "In an effect with cleanup or a data library like React Query or SWR that handles caching, loading and error states; or on the server in frameworks like Next.js.", "I use fetch inside useEffect and store the data in state.", "Works, but mention loading and error states, race conditions, and libraries like React Query that solve caching.", 5],
      ["What are keys in a list and why do they matter?", "Stable identifiers that let React match items between renders, so it preserves state and avoids re-creating elements. Indexes break when the list reorders.", "Keys help React know which item is which, you shouldn't use the index.", "Clear and correct. Explain what goes wrong with index keys when items are inserted or reordered.", 6],
    ],
  },
  {
    role: "Full stack developer", type: "mixed", difficulty: "medium", years: "2", date: "2026-02-09",
    desc: "React, Node.js, Express, PostgreSQL, REST.",
    qa: [
      ["Tell me about a project you're proud of.", "A strong answer names the problem, your role, the decisions you made, the result with a number if possible, and what you learned.", "I built an expense tracker with React and Node. I designed the API and the database, and added charts. Around 50 friends use it.", "Good structure and a real result. Add one hard decision you made and why, to show your thinking.", 7],
      ["How would you design a REST API for a blog?", "Resources like /posts and /posts/:id/comments, standard verbs, status codes, pagination, validation and auth on write routes.", "GET /posts, POST /posts, GET /posts/:id and comments under posts. Use JWT for auth.", "Solid basics. Mention pagination, validation, and the right status codes (201, 404, 422).", 6],
      ["What is the difference between SQL joins?", "INNER returns matching rows from both; LEFT keeps all rows from the left table; RIGHT the right; FULL keeps all from both.", "Inner join gives matching rows and left join gives all rows from the first table even if nothing matches.", "Correct and clear. A quick example would make it stronger.", 7],
      ["Describe a time you disagreed with a teammate.", "Situation, how you listened, the data or reasoning you brought, how you reached a decision, and the outcome.", "We disagreed about using a library. I made a small prototype to compare and we picked the faster one.", "Nice: you used evidence instead of opinion. Say what you learned about working with that teammate.", 6],
      ["How do you keep a Node.js API secure?", "Validate input, parameterised queries, auth and authorisation checks, rate limiting, secure headers, secrets in env vars, dependency updates.", "Use environment variables, hash passwords and validate inputs.", "Good start. Add parameterised queries, authorisation on every route, and rate limiting.", 5],
    ],
  },
  {
    role: "Frontend developer", type: "behavioral", difficulty: "medium", years: "3", date: "2026-04-06",
    desc: "Product team, React, design systems, accessibility.",
    qa: [
      ["Tell me about a time you missed a deadline.", "Own it, explain why, what you did to recover, how you communicated, and what you changed afterwards.", "I underestimated a feature. I told my lead early, split it into two releases, and since then I add buffer to my estimates.", "Strong: early communication and a concrete change. A number (how late, how you estimate now) would make it sharper.", 7],
      ["How do you handle feedback on your code?", "Assume good intent, ask questions to understand, separate the code from yourself, and follow up on patterns.", "I read the comments, ask if I don't understand, and fix them. I try not to take it personally.", "Good attitude. Add an example where feedback changed how you work.", 7],
      ["Describe working with a designer on a hard UI.", "Early collaboration, sharing constraints, prototypes, compromises, and the result for users.", "The designer wanted an animation that was slow on mobile. I made two options and we tested them together.", "Great example of collaboration with evidence. Mention the outcome for users.", 8],
      ["How do you make sure your UI is accessible?", "Semantic HTML, labels, keyboard support, focus states, contrast, screen reader testing, and automated checks.", "I use semantic HTML, alt text and check contrast. I test with the keyboard.", "Good coverage. Add screen reader testing and how you catch issues in review or CI.", 7],
      ["Why do you want this role?", "Connect your skills and goals to the company's product and team, with specifics.", "I like building products people use daily and your design system work is something I want to learn from.", "Specific and genuine. Tie it to one thing you've already done that fits the role.", 7],
    ],
  },
  {
    role: "Backend developer", type: "technical", difficulty: "medium", years: "3", date: "2026-06-01",
    desc: "Node.js, PostgreSQL, Redis, queues, REST APIs.",
    qa: [
      ["How would you speed up a slow SQL query?", "Check the plan with EXPLAIN, add the right indexes, avoid SELECT *, fix N+1 queries, and cache hot reads.", "Run EXPLAIN ANALYZE, add an index on the filtered columns, and only select the columns I need.", "Very good. Mention N+1 queries from the ORM and when caching is the better fix.", 8],
      ["When would you use a message queue?", "For slow or unreliable work outside the request: emails, video processing, retries, and smoothing traffic spikes.", "For background jobs like sending emails so the API responds fast, and to retry if something fails.", "Clear and practical. Add idempotency, since jobs can run twice.", 8],
      ["What is the difference between authentication and authorisation?", "Authentication checks who you are; authorisation checks what you're allowed to do.", "Authentication is login, who you are. Authorisation is permissions, what you can access.", "Correct and concise. An example of an authorisation bug would show depth.", 8],
      ["How do you handle errors in an Express API?", "Central error middleware, consistent error shape, proper status codes, logging with context, no stack traces to clients.", "I use a central error handler that returns a JSON error and logs it.", "Good. Mention status codes and hiding internal details from clients.", 7],
      ["How does caching with Redis work and what can go wrong?", "Store hot data in memory with a TTL; invalidate on writes. Risks: stale data, stampedes, and memory limits.", "Store results in Redis with an expiry so the database is hit less.", "Right idea. Add invalidation and cache stampedes for a complete answer.", 6],
    ],
  },
  {
    role: "Senior frontend developer", type: "system-design", difficulty: "hard", years: "3", date: "2026-08-10",
    desc: "Large React apps, performance, architecture, design systems.",
    qa: [
      ["Design the frontend for a collaborative document editor.", "Document model, real-time sync (CRDT or OT) over WebSockets, optimistic updates, presence, offline queue, and conflict handling.", "Use WebSockets for real-time changes, a CRDT so edits merge, show other users' cursors, and save offline changes to sync later.", "Excellent coverage of the hard parts. Add how you'd keep large documents fast to render.", 8],
      ["How would you structure a large React codebase?", "Feature folders, shared UI package, clear boundaries, typed APIs, lint rules for imports, and code ownership.", "Group by feature, keep shared components in a design system, and use TypeScript.", "Good. Mention enforcing boundaries with lint rules and how teams own areas.", 7],
      ["A page loads slowly. How do you find and fix it?", "Measure with Lighthouse and the performance panel, check LCP, bundle size, blocking requests; split code, optimise images, cache.", "Check Lighthouse and the network tab, split the bundle, lazy-load below the fold and compress images.", "Strong, measurement first. Name the metric you'd target, such as LCP.", 8],
      ["How would you build a design system?", "Tokens, accessible primitives, documentation, versioning, adoption plan, and contribution process.", "Start with tokens and basic components, document them in Storybook, and version the package.", "Solid. Add accessibility as a requirement and how you'd drive adoption.", 7],
      ["How do you decide between client and server rendering?", "Consider SEO, data freshness, interactivity and performance; often a mix: server render content, hydrate interactive parts.", "Server rendering for SEO and first load, client for very interactive parts. Usually a mix.", "Balanced answer. An example from your own work would strengthen it.", 8],
    ],
  },
  {
    role: "Frontend developer", type: "technical", difficulty: "hard", years: "3", date: "2026-10-14",
    desc: "React, Next.js, TypeScript, performance, testing.",
    qa: [
      ["How do React Server Components change data fetching?", "Server components fetch on the server and send rendered output without their JavaScript; client components handle interactivity. Data no longer has to go through the browser.", "Server components can fetch data directly on the server and send less JavaScript, and client components are only for interactive parts.", "Clear and accurate. Mention streaming with Suspense for a complete picture.", 9],
      ["How would you test a complex form?", "Unit test validation logic, integration tests with Testing Library from the user's view, and an end-to-end test for the main path.", "Test validation with unit tests, then React Testing Library to fill the form like a user, and one Playwright test for submit.", "Excellent layered approach. Add accessibility checks in the tests.", 8],
      ["What causes layout shift and how do you prevent it?", "Media without dimensions, late-loading fonts and injected content. Reserve space, set width and height, and use font-display.", "Images without sizes and fonts loading late. Set width and height and reserve space for dynamic content.", "Good, concise answer. Mention measuring CLS in the field.", 8],
    ],
  },
];

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

if (flag === "--remove") {
  const res = await db.query(`DELETE FROM "MockInterview" WHERE "userId" = $1 AND "mockId" LIKE 'demo-%'`, [userId]);
  console.log(`Removed ${res.rowCount} sample interviews (their answers went with them).`);
  await db.end();
  process.exit(0);
}

const { rows: [owner] } = await db.query(
  `SELECT "createdBy" FROM "MockInterview" WHERE "userId" = $1 LIMIT 1`, [userId]);
const email = owner?.createdBy ?? "";

await db.query("BEGIN");
try {
  let answers = 0;
  for (const [i, iv] of INTERVIEWS.entries()) {
    const mockId = `demo-${i + 1}-${iv.date}`;
    const created = new Date(`${iv.date}T10:00:00Z`);
    // Five questions per interview; the last one may be partly answered.
    const questions = iv.qa.map(([q, a]) => ({ question: q, answer: a }));
    while (questions.length < 5) {
      questions.push({ question: "Tell me about a technical decision you'd make differently now.", answer: "Name the decision, the context, what you learned, and what you'd do instead." });
    }
    await db.query(
      `INSERT INTO "MockInterview" ("mockId","userId","createdBy","jobPosition","jobDesc","jobExperience","interviewType","difficulty","jsonMockResp","createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT ("mockId") DO NOTHING`,
      [mockId, userId, email, iv.role, iv.desc, iv.years, iv.type, iv.difficulty, JSON.stringify(questions), created]);
    for (const [index, [q, a, said, feedback, rating]] of iv.qa.entries()) {
      await db.query(
        `INSERT INTO "userAnswer" ("mockId","questionIndex","question","correctAns","userAns","feedback","rating","userEmail","createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT ("mockId","questionIndex") DO NOTHING`,
        [mockId, index, q, a, said, feedback, rating, email, new Date(created.getTime() + (index + 1) * 4 * 60000)]);
      answers++;
    }
  }
  await db.query("COMMIT");
  console.log(`Added ${INTERVIEWS.length} sample interviews with ${answers} rated answers.`);
} catch (e) {
  await db.query("ROLLBACK");
  throw e;
} finally {
  await db.end();
}
