import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { useAuth } from "@/src/auth/AuthProvider";
import { db } from "@/src/lib/firebase";

/**
 * Admin is determined by a Firestore doc:
 *   admins/{email} -> { enabled: true }
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(!!user);

  useEffect(() => {
    const email = user?.email ?? null;
    if (!email) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(db, "admins", email);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const enabled = snap.exists() ? Boolean((snap.data() as any)?.enabled) : false;
        setIsAdmin(enabled);
        setLoading(false);
      },
      () => {
        setIsAdmin(false);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.email]);

  return { isAdmin, loading };
}
