import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Comment } from "@/src/types/comment";

export function useComments(postId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const q = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc"),
      limit(50),
    );

    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Comment, "id">),
        })),
      );
      setLoading(false);
    });

    return () => unsub();
  }, [postId]);

  return { comments, loading };
}
