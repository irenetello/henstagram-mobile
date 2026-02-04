import { useEffect } from "react";

import { subscribeActiveChallenges } from "@/src/lib/challenges/challengeApi";
import { scheduleChallengeIfNeeded } from "@/src/notifications/scheduleChallengeNotifications";

export function ChallengeNotificationScheduler() {
  useEffect(() => {
    const unsubscribe = subscribeActiveChallenges((challenges) => {
      challenges.forEach((c) => {
        scheduleChallengeIfNeeded(c).catch((err) => {
          console.warn("[ChallengeNotificationScheduler] schedule failed", err);
        });
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
