import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Check if the current user is an admin
 * @returns Object with isAdmin boolean and session data, or null if not authenticated
 */
export async function checkAdminAccess() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { isAdmin: false, session: null };
    }

    const isAdmin = session.user.isAdmin === true;
    
    return { isAdmin, session };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAdmin: false, session: null };
  }
}

/**
 * Require admin access - throws error or returns null if not admin
 * Use this in API routes to ensure only admins can access
 */
export async function requireAdmin() {
  const { isAdmin, session } = await checkAdminAccess();
  
  if (!isAdmin || !session) {
    return null;
  }
  
  return session;
}

