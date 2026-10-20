import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { db } from "@/utils/db";
import { AiUsage, MockInterview } from "@/utils/schema";

// Clerk calls this when a user deletes their account, so their interviews
// don't outlive it. The signature is checked with CLERK_WEBHOOK_SIGNING_SECRET.
export async function POST(req) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch (e) {
    console.error("Clerk webhook verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.deleted" && event.data.id) {
    const userId = event.data.id;
    // Answers go with their interviews via ON DELETE CASCADE.
    await db.delete(MockInterview).where(eq(MockInterview.userId, userId));
    await db.delete(AiUsage).where(eq(AiUsage.userId, userId));
  }

  return new Response("OK");
}
