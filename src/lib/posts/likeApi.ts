import {
  doc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";

/**
 * Listener realtime: si el usuario ha dado like o no.
 */
export function listenUserLike(params: {
  postId: string;
  userId: string;
  onChange: (liked: boolean) => void;
}): Unsubscribe {
  const likeRef = doc(db, "posts", params.postId, "likes", params.userId);
  return onSnapshot(likeRef, (snap) => params.onChange(snap.exists()));
}

/**
 * Toggle like/unlike atómico:
 * - crea o borra el doc posts/{postId}/likes/{userId}
 * - incrementa/decrementa likesCount en el post
 */
export async function toggleLike(params: { postId: string; userId: string }) {
  const likeRef = doc(db, "posts", params.postId, "likes", params.userId);

  await runTransaction(db, async (tx) => {
    const likeSnap = await tx.get(likeRef);

    if (likeSnap.exists()) {
      tx.delete(likeRef);
    } else {
      tx.set(likeRef, { createdAt: serverTimestamp() });
    }
  });
}
