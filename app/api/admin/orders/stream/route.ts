import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { createSSEStream } from "@/lib/sse";
import { randomUUID } from "crypto";

/**
 * GET: Server-Sent Events endpoint for real-time order updates
 * Only accessible by admins
 */
export async function GET(
  _req: NextRequest // eslint-disable-line @typescript-eslint/no-unused-vars
) {
  try {
    // Check admin access
    const session = await requireAdmin();
    if (!session) {
      return new Response("Unauthorized", { status: 403 });
    }

    // Generate unique client ID
    const clientId = randomUUID();

    // Create and return SSE stream
    return createSSEStream(clientId);
  } catch (error) {
    console.error("Error creating SSE stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
