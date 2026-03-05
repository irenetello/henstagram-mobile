import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "@/src/lib/firebase";

export function useMinigamesEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "appConfig", "features");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() as { minigamesEnabled?: boolean } | undefined;
        setEnabled(Boolean(data?.minigamesEnabled));
        setLoading(false);
      },
      () => {
        setEnabled(false);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { enabled, loading };
}
