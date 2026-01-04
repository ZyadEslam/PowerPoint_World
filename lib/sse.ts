/**
 * Server-Sent Events (SSE) utility for real-time order updates
 * Uses a simple in-memory store for connections (for production, consider Redis)
 */

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  lastEventId: number;
};

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private eventId: number = 0;

  /**
   * Add a new SSE client connection
   */
  addClient(clientId: string, controller: ReadableStreamDefaultController): void {
    this.clients.set(clientId, {
      id: clientId,
      controller,
      lastEventId: this.eventId,
    });
  }

  /**
   * Remove a client connection
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Broadcast a message to all connected clients
   */
  broadcast(event: string, data: unknown): void {
    this.eventId++;
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\nid: ${this.eventId}\n\n`;

    const clientsToRemove: string[] = [];

    this.clients.forEach((client, clientId) => {
      try {
        client.controller.enqueue(new TextEncoder().encode(message));
        client.lastEventId = this.eventId;
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        clientsToRemove.push(clientId);
      }
    });

    // Remove failed clients
    clientsToRemove.forEach((clientId) => this.removeClient(clientId));
  }

  /**
   * Send a message to a specific client
   */
  sendToClient(clientId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    try {
      this.eventId++;
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\nid: ${this.eventId}\n\n`;
      client.controller.enqueue(new TextEncoder().encode(message));
      client.lastEventId = this.eventId;
      return true;
    } catch (error) {
      console.error(`Error sending message to client ${clientId}:`, error);
      this.removeClient(clientId);
      return false;
    }
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get the last event ID
   */
  getLastEventId(): number {
    return this.eventId;
  }
}

// Singleton instance
export const sseManager = new SSEManager();

/**
 * Create an SSE response stream
 */
export function createSSEStream(clientId: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));

      // Add client to manager
      sseManager.addClient(clientId, controller);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(heartbeat));
        } catch {
          clearInterval(heartbeatInterval);
          sseManager.removeClient(clientId);
        }
      }, 30000);

      // Cleanup on close
      return () => {
        clearInterval(heartbeatInterval);
        sseManager.removeClient(clientId);
      };
    },
    cancel() {
      sseManager.removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in nginx
    },
  });
}

