import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export type BingoWinner = {
  userId: string;
  username?: string | null;
  postId?: string;
  line?: { type: "row" | "col"; index: number };
  wonAt?: any;
};

export function useBingoWinner(cardId: string) {
  const [winner, setWinner] = useState<BingoWinner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "bingoWinners", cardId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setWinner(snap.exists() ? (snap.data() as any) : null);
        setLoading(false);
      },
      (e) => {
        console.error("useBingoWinner snapshot error", e);
        setLoading(false);
      },
    );
    return unsub;
  }, [cardId]);

  return { winner, loading };
}
