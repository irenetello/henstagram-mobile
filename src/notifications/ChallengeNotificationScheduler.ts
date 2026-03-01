import { useEffect } from "react";
import { useAuth } from "@/src/auth/AuthProvider";
import { subscribeActiveChallenges } from "@/src/lib/challenges/challengeApi";
import { scheduleChallengeIfNeeded } from "@/src/notifications/scheduleChallengeNotifications";

export function ChallengeNotificationScheduler() {
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;
    if (!user) return;

    const unsubscribe = subscribeActiveChallenges((challenges) => {
      challenges.forEach((c) => {
        scheduleChallengeIfNeeded(c).catch((err) => {
          console.warn("[ChallengeNotificationScheduler] schedule failed", err);
        });
      });
    });

    return unsubscribe;
  }, [user, initializing]);

  return null;
}
