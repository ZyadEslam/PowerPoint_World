"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function TestSignIn() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const testGoogleSignIn = async () => {
    setIsLoading(true);
    console.log("🔐 Testing Google sign in...");
    
    try {
      const result = await signIn("google", {
        redirect: false, // Don't redirect automatically so we can see the result
      });
      console.log("✅ SignIn result:", result);
      alert(`Sign in result: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error("❌ SignIn error:", error);
      alert(`Sign in error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectURL = () => {
    console.log("🔗 Testing direct URL navigation...");
    window.location.href = "/api/auth/signin/google";
  };

  const checkProviders = async () => {
    try {
      const response = await fetch("/api/auth/providers");
      const providers = await response.json();
      console.log("📋 Available providers:", providers);
      alert(`Providers: ${JSON.stringify(providers, null, 2)}`);
    } catch (error) {
      console.error("❌ Error fetching providers:", error);
      alert(`Provider fetch error: ${error}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">NextAuth Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Session Status:</h2>
        <p>Status: {status}</p>
        <p>User: {session?.user?.name || "Not signed in"}</p>
        <p>Email: {session?.user?.email || "N/A"}</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={testGoogleSignIn}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Google Sign In (with result)"}
        </button>

        <button
          onClick={testDirectURL}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Direct URL Navigation
        </button>

        <button
          onClick={checkProviders}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Check Available Providers
        </button>

        {session && (
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-600">
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
}