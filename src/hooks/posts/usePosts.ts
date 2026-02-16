import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { Post } from "@/src/types/post";
import { mapPostDoc } from "@/src/lib/posts/mapPost";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map(mapPostDoc));
        setLoading(false);
      },
      (err) => {
        console.error("Feed snapshot error:", err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { posts, loading };
}
