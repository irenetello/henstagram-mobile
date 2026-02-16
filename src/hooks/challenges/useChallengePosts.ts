import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { Post } from "@/src/types/post";

export function useChallengePosts(challengeId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(!!challengeId);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!challengeId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "posts"),
      where("challengeId", "==", challengeId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Post[];
        setPosts(items);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [challengeId]);

  return { posts, loading, error };
}
