import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import { sendExpoPush } from "./notifications";

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

// 🔔 Push cuando un challenge pasa de DRAFT -> ACTIVE (startAt aparece)
export const onChallengeActivated = onDocumentUpdated(
  "challenges/{challengeId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
console.log("onChallengeActivated fired", event.params.challengeId);
console.log("startAt before/after", before.startAt ?? null, after.startAt ?? null);

    const wasDraft = !before.startAt;
    const nowActive = !!after.startAt;

    if (!wasDraft || !nowActive) return;

    // 1) recoger tokens de users
    const usersSnap = await db.collection("users").get();
    const tokens = new Set<string>();

    for (const docSnap of usersSnap.docs) {
      const data = docSnap.data();
      const arr = data.expoPushTokens;
      if (Array.isArray(arr)) {
        for (const t of arr) if (typeof t === "string" && t.trim()) tokens.add(t.trim());
      }
    }

    const title = typeof after.title === "string" ? after.title : "A new challenge is live!";
    const challengeId = event.params.challengeId;
console.log("Sending push to tokens...");

    // 2) enviar push
    await sendExpoPush(
      [...tokens].map((to) => ({
        to,
        title: "New challenge 🔥",
        body: title,
        data: { challengeId },
        sound: "default",
      }))
    );
  }
);
