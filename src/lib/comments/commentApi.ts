import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";

type AddCommentInput = {
  postId: string;
  userId: string;
  text: string;
  username?: string;
  userEmail?: string;
};

export async function addComment(input: AddCommentInput) {
  const ref = collection(db, "posts", input.postId, "comments");

  await addDoc(ref, {
    postId: input.postId,
    userId: input.userId,
    text: input.text.trim(),
    username: input.username ?? null,
    userEmail: input.userEmail ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(input: { postId: string; commentId: string }) {
  await deleteDoc(doc(db, "posts", input.postId, "comments", input.commentId));
}
