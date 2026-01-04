import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("🚀 NextAuth route handler loaded");
console.log("Environment:", process.env.NODE_ENV);
console.log("VERCEL:", !!process.env.VERCEL);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

// Create handler with comprehensive error handling
const createHandler = () => {
  try {
    console.log("✅ Creating NextAuth handler...");

    // Validate required environment variables
    const requiredEnvVars = [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "NEXTAUTH_SECRET",
    ];

    const missingVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
      console.warn("⚠️ NEXTAUTH_URL not set in production");
    }

    const handler = NextAuth(authOptions);
    console.log("✅ NextAuth handler created successfully");

    return handler;
  } catch (error) {
    console.error("❌ Failed to create NextAuth handler:", error);

    // Return error handler
    return {
      GET: () => {
        return new Response(
          JSON.stringify({
            error: "NextAuth configuration error",
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
      POST: () => {
        return new Response(
          JSON.stringify({
            error: "NextAuth configuration error",
            details: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      },
    };
  }
};

const handler = createHandler();

export { handler as GET, handler as POST };
