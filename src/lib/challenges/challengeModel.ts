import type { Challenge, ChallengeDerivedStatus } from "@/src/types/challenge";
import { Timestamp } from "firebase/firestore";

function asNullable<T>(v: T | undefined): T | null {
  return typeof v === "undefined" ? null : (v as T);
}

function asTimestamp(v: any): Timestamp | null {
  if (!v) return null;

  // Timestamp real
  if (v instanceof Timestamp) return v;

  // Objetos Firestore con toDate (incluye serverTimestamp estimate)
  if (typeof v?.toDate === "function") {
    return Timestamp.fromDate(v.toDate());
  }

  // Objetos Firestore con toMillis
  if (typeof v?.toMillis === "function") {
    return Timestamp.fromMillis(v.toMillis());
  }

  // Formato { seconds, nanoseconds }
  if (typeof v?.seconds === "number" && typeof v?.nanoseconds === "number") {
    return new Timestamp(v.seconds, v.nanoseconds);
  }

  // Date normal
  if (v instanceof Date) return Timestamp.fromDate(v);

  return null;
}

/**
 * Maps Firestore doc data to our Challenge shape.
 * - Normalizes missing fields to null where it matters (startAt/endAt/deletedAt).
 */
export function mapChallenge(id: string, data: any): Challenge {
  return {
    id,
    title: String(data?.title ?? ""),
    prompt: String(data?.prompt ?? ""),
    createdByUid: String(data?.createdByUid ?? ""),
    createdByName: data?.createdByName ?? null,

    startAt: asTimestamp(data?.startAt),
    endAt: asTimestamp(data?.endAt),
    createdAt: asTimestamp(data?.createdAt) ?? Timestamp.now(),

    isDeleted: data?.isDeleted ?? false,

    deletedAt: asTimestamp(data?.deletedAt),
    deletedByUid: data?.deletedByUid ?? null,

    coverImageUrl: data?.coverImageUrl ?? null,
  };
}

function toMillis(v: any): number | null {
  if (!v) return null;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v?.toDate === "function") return v.toDate().getTime();
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v;
  return null;
}

export function getChallengeStatus(
  challenge: Pick<Challenge, "startAt" | "endAt">,
  now: Date = new Date(),
): ChallengeDerivedStatus {
  const startMs = toMillis(challenge.startAt);
  if (!startMs) return "DRAFT";

  const endMs = toMillis(challenge.endAt);
  if (!endMs) return "ACTIVE";

  return endMs <= now.getTime() ? "ENDED" : "ACTIVE";
}

export function formatMaybeDate(v: any): string {
  const ms = toMillis(v);
  if (!ms) return "—";

  const d = new Date(ms);

  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
