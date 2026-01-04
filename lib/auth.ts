import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// Import your database client/ORM
import dbConnect from "./mongoose"; // Adjust import path
import User from "@/app/models/user";
// Note: Login logging can be added in the NextAuth callbacks if needed

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Validate required user data
          if (!user.email) {
            return false;
          }

          await dbConnect();

          // Check if user exists in your database
          let dbUser = await User.findOne({
            email: user.email,
          });

          // If the user does not exist, create a new user in your database
          if (!dbUser) {
            // Check if this email should be granted admin access on first sign-in
            const firstAdminEmail =
              process.env.FIRST_ADMIN_EMAIL?.toLowerCase().trim();
            const userEmail = user.email?.toLowerCase().trim();
            const shouldBeAdmin =
              firstAdminEmail && userEmail === firstAdminEmail;

            try {
              // Use Mongoose create method instead of insertOne
              dbUser = await User.create({
                email: user.email,
                name: user.name || user.email.split("@")[0],
                isAdmin: shouldBeAdmin || false,
                cart: [],
                addresses: [],
              });

            } catch (createError: unknown) {
              // Handle duplicate email error (race condition)
              // MongoDB duplicate key error code is 11000
              const isDuplicateError =
                createError &&
                typeof createError === "object" &&
                "code" in createError &&
                (createError as { code: number }).code === 11000;

              if (isDuplicateError) {
                dbUser = await User.findOne({ email: user.email });
                if (!dbUser) {
                  return false;
                }
              } else {
                throw createError;
              }
            }
          }

          // Store the database user ID in the user object
          if (dbUser && dbUser._id) {
            user.id = dbUser._id.toString();
            user.isAdmin = dbUser.isAdmin || false;
          } else {
            return false;
          }
        } catch (error: unknown) {
          const errorDetails: Record<string, unknown> = {
            email: user?.email,
          };

          if (error instanceof Error) {
            errorDetails.message = error.message;
            errorDetails.stack = error.stack;
            errorDetails.errorName = error.name;
          }

          if (error && typeof error === "object" && "code" in error) {
            errorDetails.errorCode = error.code;
          }

          // Only deny access for critical errors, not transient issues
          // Return false to trigger AccessDenied error page
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user, trigger, session }) {
      // Add user id and isAdmin to the token when user signs in
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id; // This will now be your database user ID
        token.isAdmin = user.isAdmin;
      }

      // Update isAdmin when session is updated (if needed)
      if (trigger === "update" && session?.isAdmin !== undefined) {
        token.isAdmin = session.isAdmin;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, including the actual database user id
      if (session.user && token.id) {
        session.user.id = token.id as string; // Your database user ID
      }

      // Add isAdmin to session
      if (token.isAdmin !== undefined) {
        session.user.isAdmin = token.isAdmin as boolean;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
  },
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
