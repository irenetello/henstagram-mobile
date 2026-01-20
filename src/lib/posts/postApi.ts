import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { db, storage } from "@/src/lib/firebase";
import type { Post } from "@/src/types/post";

/**
 * Crea un post en Firestore
 * (Storage se asume ya subido)
 */
export async function createPost(input: {
  userId: string;
  imageUrl: string;
  storagePath: string;
  caption?: string;
  username?: string;
  userEmail?: string;
}) {
  await addDoc(collection(db, "posts"), {
    userId: input.userId,
    imageUrl: input.imageUrl,
    storagePath: input.storagePath,
    caption: input.caption ?? "",
    username: input.username ?? null,
    userEmail: input.userEmail ?? null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Borra un post (Firestore + Storage)
 */
export async function deletePost(post: Pick<Post, "id" | "storagePath">) {
  // 1️⃣ borrar imagen de Storage
  if (post.storagePath) {
    await deleteObject(ref(storage, post.storagePath));
  }

  // 2️⃣ borrar documento de Firestore
  await deleteDoc(doc(db, "posts", post.id));
}
