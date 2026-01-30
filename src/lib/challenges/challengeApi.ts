import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase";
import type { Challenge } from "@/src/types/challenge";
import { mapChallenge } from "@/src/lib/challenges/challengeModel";

export function subscribeActiveChallenges(cb: (items: Challenge[]) => void) {
  const q = query(
    collection(db, "challenges"),
    where("isDeleted", "==", false),
    where("startAt", "!=", null),
    orderBy("startAt", "desc"),
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => mapChallenge(d.id, d.data()));
      cb(items);
    },
    (err) => {
      console.log("🔥 subscribeActiveChallenges error:", err);
      cb([]);
    },
  );
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  const ref = doc(db, "challenges", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapChallenge(snap.id, snap.data());
}

export async function createChallenge(input: {
  title: string;
  prompt: string;
  createdByUid: string;
  createdByName?: string;
  coverImageUrl?: string | null;
}) {
  await addDoc(collection(db, "challenges"), {
    title: input.title,
    prompt: input.prompt,
    createdByUid: input.createdByUid,
    createdByName: input.createdByName ?? null,
    coverImageUrl: input.coverImageUrl ?? null,

    createdAt: serverTimestamp(),

    // Draft by default
    startAt: null,
    endAt: null,

    // Soft delete
    isDeleted: false,
    deletedAt: null,
    deletedByUid: null,
  });
}

export async function activateChallenge(input: {
  challengeId: string;
  durationMs: number | null; // null => no limit
}) {
  const ref = doc(db, "challenges", input.challengeId);

  const endAt =
    input.durationMs == null
      ? null
      : Timestamp.fromMillis(Date.now() + Math.max(0, input.durationMs));

  await updateDoc(ref, {
    startAt: serverTimestamp(),
    endAt,
  });
}

export async function softDeleteChallenge(input: {
  challengeId: string;
  deletedByUid: string;
}) {
  const ref = doc(db, "challenges", input.challengeId);

  await updateDoc(ref, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    deletedByUid: input.deletedByUid,
  });
}
