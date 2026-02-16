import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export function useLikesCount(postId: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!postId) {
      setCount(0);
      return;
    }

    const ref = collection(db, "posts", postId, "likes");
    const q = query(ref);

    const unsub = onSnapshot(q, (snap) => {
      setCount(snap.size);
    });

    return unsub;
  }, [postId]);

  return count;
}
