import { doc, setDoc } from "firebase/firestore";

import { db } from "@/src/lib/firebase";

export async function setMinigamesEnabled(enabled: boolean) {
  const ref = doc(db, "appConfig", "features");
  await setDoc(ref, { minigamesEnabled: enabled }, { merge: true });
}

export async function setAppLaunched(enabled: boolean) {
  const ref = doc(db, "appConfig", "features");
  await setDoc(ref, { appLaunched: enabled }, { merge: true });
}
