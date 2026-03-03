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
        data: { 
          challengeId,
          url: `henstagrammobile://challenge/${challengeId}`,
        },
        sound: "default",
      }))
    );
  }
);

// 🧩 Bingo winner: first user to complete any ROW or COLUMN wins.
// Writes to: bingoWinners/{cardId}
export const onBingoPostCreated = onDocumentCreated("posts/{postId}", async (event) => {
  const post = event.data?.data();
  if (!post) return;

  const bingoCardId = post.bingoCardId;
  const bingoCellId = post.bingoCellId;
  const userId = post.userId;
  const username = post.username ?? post.userEmail ?? null;

  if (!bingoCardId || !bingoCellId || !userId) return;

  const winnerRef = db.doc(`bingoWinners/${bingoCardId}`);

  // Build set of this user's completed cells for this card
  const qSnap = await db
    .collection("posts")
    .where("userId", "==", userId)
    .where("bingoCardId", "==", bingoCardId)
    .get();

  const completed = new Set<string>(["c22"]); // free square
  for (const d of qSnap.docs) {
    const data = d.data();
    if (typeof data.bingoCellId === "string") completed.add(data.bingoCellId);
  }

  const size = 5;
  const hasLine = () => {
    // rows
    for (let r = 0; r < size; r++) {
      let ok = true;
      for (let c = 0; c < size; c++) {
        if (!completed.has(`c${r}${c}`)) {
          ok = false;
          break;
        }
      }
      if (ok) return { type: "row" as const, index: r };
    }
    // cols
    for (let c = 0; c < size; c++) {
      let ok = true;
      for (let r = 0; r < size; r++) {
        if (!completed.has(`c${r}${c}`)) {
          ok = false;
          break;
        }
      }
      if (ok) return { type: "col" as const, index: c };
    }
    return null;
  };

  const line = hasLine();
  if (!line) return;

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(winnerRef);
    if (existing.exists) return;

    tx.set(winnerRef, {
      userId,
      username,
      postId: event.params.postId,
      line,
      wonAt: FieldValue.serverTimestamp(),
    });
  });
});
