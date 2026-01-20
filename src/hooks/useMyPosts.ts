import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/src/auth/AuthProvider";
import type { Post } from "../types/post";
import { mapPostDoc } from "@/src/lib/posts/mapPost";

export function useMyPosts() {
  const { user, initializing } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initializing) return;

    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "posts"),
      where("userId", "==", user.uid), // ✅ aquí está el fix
      orderBy("createdAt", "desc"),
      limit(120),
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map(mapPostDoc));
        setLoading(false);
      },
      (err) => {
        console.error("Profile snapshot error:", err);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user, initializing]);

  return { posts, loading };
}
