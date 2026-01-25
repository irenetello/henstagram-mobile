import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { db, storage } from "@/src/lib/firebase";
import type { Post } from "@/src/types/post";

export async function createPost(input: {
  userId: string;
  imageUrl: string;
  storagePath: string;
  caption?: string;
  username?: string;
  userEmail?: string;
  challengeId?: string;
  challengeTitle?: string;
}) {
  const data: any = {
    userId: input.userId,
    imageUrl: input.imageUrl,
    storagePath: input.storagePath,
    caption: input.caption ?? "",
    username: input.username ?? null,
    userEmail: input.userEmail ?? null,
    createdAt: serverTimestamp(),
  };

  if (input.challengeId) {
    data.challengeId = input.challengeId;
    data.challengeTitle = input.challengeTitle ?? null;
  }

  await addDoc(collection(db, "posts"), data); // ✅ NO envolver en { data }
}

export async function deletePost(post: Pick<Post, "id" | "storagePath">) {
  if (post.storagePath) {
    await deleteObject(ref(storage, post.storagePath));
  }
  await deleteDoc(doc(db, "posts", post.id));
}
