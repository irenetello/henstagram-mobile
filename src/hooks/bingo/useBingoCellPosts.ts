import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import { mapPostDoc } from "@/src/lib/posts/mapPost";
import type { Post } from "@/src/types/post";

export function useBingoCellPosts(cardId: string, cellId: string) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const q = useMemo(() => {
    return query(
      collection(db, "posts"),
      where("bingoCardId", "==", cardId),
      where("bingoCellId", "==", cellId),
      orderBy("createdAt", "desc"),
    );
  }, [cardId, cellId]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        setPosts(snap.docs.map(mapPostDoc));
        setLoading(false);
      },
      (e) => {
        console.error("useBingoCellPosts snapshot error", e);
        setError(e?.message ?? "Failed to load bingo posts");
        setLoading(false);
      },
    );

    return unsub;
  }, [q]);

  return { posts, loading, error };
}
