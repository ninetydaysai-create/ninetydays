"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { initPosthog, identifyUser, resetUser } from "@/lib/posthog";

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  const { userId, isSignedIn } = useAuth();

  useEffect(() => {
    initPosthog();
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) {
      identifyUser(userId);
    } else if (isSignedIn === false) {
      resetUser();
    }
  }, [isSignedIn, userId]);

  return <>{children}</>;
}
