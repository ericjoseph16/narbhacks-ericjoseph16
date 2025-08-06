"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { ErrorBoundary } from "../utils/ErrorBoundary";

let convex: ConvexReactClient | null = null;

if (typeof window !== "undefined") {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
  } else {
    convex = new ConvexReactClient(convexUrl);
  }
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey) {
    console.warn("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
    return <>{children}</>;
  }

  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
