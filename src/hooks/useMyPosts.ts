import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import { auth } from "../lib/auth";

export type Post = {
  id: string;
  uid: string;
  imageUrl: string;
  caption?: string;
  createdAt?: any;
};

export function useMyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubPosts: null | (() => void) = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // limpia listener anterior si cambia user
      if (unsubPosts) {
        unsubPosts();
        unsubPosts = null;
      }

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

      unsubPosts = onSnapshot(
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
    });

    return () => {
      unsubAuth();
      if (unsubPosts) unsubPosts();
    };
  }, []);

  return { posts, loading };
}
