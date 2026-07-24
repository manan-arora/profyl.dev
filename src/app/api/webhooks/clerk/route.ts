import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { handleClerkWebhook } from "@/lib/webhooks/clerk/index";

export async function POST(req: NextRequest) {
  let event: WebhookEvent;

  try {
    event = (await verifyWebhook(req)) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { id } = event.data;
  const eventType = event.type;

  console.log(`[Clerk Webhook] Received event: ${eventType}, User ID: ${id || "unknown"}`);

  // Handle only specific events
  if (
    eventType !== "user.created" &&
    eventType !== "user.updated" &&
    eventType !== "user.deleted"
  ) {
    console.log(`[Clerk Webhook] Ignoring unhandled event: ${eventType}`);
    return new Response("Event ignored", { status: 200 });
  }

  try {
    await handleClerkWebhook(event);
    console.log(`[Clerk Webhook] Successfully processed event: ${eventType}, User ID: ${id}`);
    return new Response("Webhook processed successfully", { status: 200 });
  } catch (err) {
    console.error(`[Clerk Webhook] Database failure for event ${eventType}:`, err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
