import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

import { useAuth } from "@/src/auth/AuthProvider";
import { db } from "@/src/lib/firebase";

export function useMyBingoCells(cardId: string) {
  const { user } = useAuth();
  const [cellIds, setCellIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const q = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, "posts"),
      where("userId", "==", user.uid),
      where("bingoCardId", "==", cardId),
      orderBy("createdAt", "desc"),
    );
  }, [user, cardId]);

  useEffect(() => {
    if (!q) {
      setCellIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
      const next = new Set<string>();
      for (const d of snap.docs) {
        const data = d.data();
        if (data.bingoCellId) next.add(String(data.bingoCellId));
      }
      // Free square counts for everyone
      next.add("c22");
      setCellIds(next);
      setLoading(false);
    });
    return unsub;
  }, [q]);

  return { cellIds, loading };
}
