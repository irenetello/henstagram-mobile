import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import type { Challenge } from "@/src/types/challenge";

export function subscribeActiveChallenges(cb: (items: Challenge[]) => void) {
  const q = query(
    collection(db, "challenges"),
    where("status", "==", "active"),
    orderBy("endAt", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const items: Challenge[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Challenge, "id">),
    }));
    cb(items);
  });
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  const ref = doc(db, "challenges", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Challenge, "id">) };
}

export async function createChallenge(input: {
  title: string;
  prompt: string;
  createdByUid: string;
  createdByName?: string;
  startAt: any; // Date o Timestamp (usamos Date aquí)
  endAt: any; // Date
}) {
  await addDoc(collection(db, "challenges"), {
    title: input.title,
    prompt: input.prompt,
    createdByUid: input.createdByUid,
    createdByName: input.createdByName ?? null,
    startAt: input.startAt,
    endAt: input.endAt,
    status: "active",
    createdAt: serverTimestamp(),
  });
}
