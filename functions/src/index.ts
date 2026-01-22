import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";

initializeApp();
const db = getFirestore();

export const onCommentCreated = onDocumentCreated(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const postId = event.params.postId;
    const postRef = db.doc(`posts/${postId}`);

    await postRef.update({
      commentsCount: FieldValue.increment(1),
    });
  }
);

export const onCommentDeleted = onDocumentDeleted(
  "posts/{postId}/comments/{commentId}",
  async (event) => {
    const postId = event.params.postId;
    const postRef = db.doc(`posts/${postId}`);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(postRef);
      const current = (snap.data()?.commentsCount ?? 0) as number;
      tx.update(postRef, { commentsCount: Math.max(0, current - 1) });
    });
  }
);
