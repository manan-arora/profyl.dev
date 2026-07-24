import { WebhookEvent } from "@clerk/nextjs/server";
import { handleUserCreated } from "./handlers/userCreated";
import { handleUserUpdated } from "./handlers/userUpdated";
import { handleUserDeleted } from "./handlers/userDeleted";

export async function handleClerkWebhook(event: WebhookEvent) {
  switch (event.type) {
    case "user.created":
      await handleUserCreated(event.data);
      break;
    case "user.updated":
      await handleUserUpdated(event.data);
      break;
    case "user.deleted":
      await handleUserDeleted(event.data);
      break;
    default:
      // Safety fallback. The route handler should have already filtered these.
      throw new Error(`[Clerk Webhook] Dispatcher encountered unhandled event: ${event.type}`);
  }
}
