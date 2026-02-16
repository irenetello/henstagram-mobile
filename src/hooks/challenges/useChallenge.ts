import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { Challenge } from "@/src/types/challenge";

export function useChallenge(challengeId: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState<boolean>(!!challengeId);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!challengeId) {
      setChallenge(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "challenges", challengeId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setChallenge(
          snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Challenge) : null,
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [challengeId]);

  return { challenge, loading, error };
}
