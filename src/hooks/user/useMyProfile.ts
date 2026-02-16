import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/auth/AuthProvider";

export function useMyProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDisplayName(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setDisplayName(snap.exists() ? (snap.data().displayName as string) : null);
        setLoading(false);
      },
      () => setLoading(false),
    );

    return () => unsub();
  }, [user]);

  return { displayName, loading };
}
