import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, storage } from "@/src/lib/firebase";
import { auth } from "@/src/lib/auth";
import { Post } from "@/src/types/post";
import { deleteObject, ref } from "firebase/storage";

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
    const already = await hasParticipatedInChallenge(input.challengeId);
    if (already) {
      throw new Error("You already participated in this challenge");
    }
  }

  await addDoc(collection(db, "posts"), data); // ✅ NO envolver en { data }
}

export async function deletePost(post: Pick<Post, "id" | "storagePath">) {
  if (post.storagePath) {
    await deleteObject(ref(storage, post.storagePath));
  }
  await deleteDoc(doc(db, "posts", post.id));
}

export async function hasParticipatedInChallenge(challengeId: string): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;

  const q = query(
    collection(db, "posts"),
    where("userId", "==", uid),
    where("challengeId", "==", challengeId),
  );

  const snap = await getDocs(q);
  return !snap.empty;
}
