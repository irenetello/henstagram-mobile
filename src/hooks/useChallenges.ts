import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
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

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, "challenges"),
      where("status", "==", "active"),
      orderBy("endAt", "asc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Challenge[];
        setChallenges(list);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { challenges, loading, error };
}
