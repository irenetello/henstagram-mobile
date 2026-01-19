import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/src/auth/AuthProvider";

export type Post = {
  id: string;
  uid: string;
  imageUrl: string;
  caption?: string;
  createdAt?: any;
};

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
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(120),
    );

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
        console.error("Profile snapshot error:", err);
        setLoading(false);
      },
    );

    return unsub;
  }, [user, initializing]);

  return { posts, loading };
}
