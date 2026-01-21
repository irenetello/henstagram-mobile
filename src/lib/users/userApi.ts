import { db } from "@/src/lib/firebase";
import { auth } from "@/src/lib/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string;
};

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as any) : null;
}

export async function upsertMyProfile(displayName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const cleanName = displayName.trim();
  if (!cleanName) throw new Error("Display name empty");

  await setDoc(
    doc(db, "users", user.uid),
    {
      displayName: cleanName,
      email: user.email ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return cleanName;
}
