import type { Timestamp } from "firebase/firestore";

export type ChallengeDerivedStatus = "DRAFT" | "ACTIVE" | "ENDED";

export type Challenge = {
  id: string;

  title: string;
  prompt: string;

  createdByUid: string;
  createdByName?: string | null;

  // ✅ Siempre debería existir (backfill ya hecho en tus docs)
  createdAt: Timestamp;

  // Scheduling
  startAt?: Timestamp | null;
  endAt?: Timestamp | null;

  // ✅ Best practice para filtrar sin depender de null/missing
  isDeleted: boolean;

  // Soft delete metadata
  deletedAt?: Timestamp | null;
  deletedByUid?: string | null;

  // Optional
  coverImageUrl?: string | null;
};
