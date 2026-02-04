import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import type { Challenge } from "@/src/types/challenge";
import { mapChallenge } from "@/src/lib/challenges/challengeModel";

export function useChallengesUser() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, "challenges"),
      where("isDeleted", "==", false),
      where("startAt", "!=", null),
      orderBy("startAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) =>
          mapChallenge(d.id, d.data({ serverTimestamps: "estimate" })),
        );
        setChallenges(items);
        setLoading(false);
      },
      (err) => {
        console.log("🔥 useChallengesUser error:", err);
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { challenges, loading, error };
}
