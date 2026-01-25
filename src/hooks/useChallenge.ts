import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export type Challenge = {
  id: string;
  title: string;
  prompt: string;
  status: "active" | "ended";
  startAt?: any;
  endAt?: any;
  createdByUid?: string;
  createdAt?: any;
};

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
