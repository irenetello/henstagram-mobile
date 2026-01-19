import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export type Post = {
  id: string;
  uid: string;
  imageUrl: string;
  caption?: string;
  createdAt?: any;
};

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Post, "id">),
        }));

        setPosts(data);
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
