import type { Challenge, ChallengeDerivedStatus } from "@/src/types/challenge";

function asNullable<T>(v: T | undefined): T | null {
  return typeof v === "undefined" ? null : (v as T);
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

    createdAt: data?.createdAt, // as Timestamp

    startAt: data?.startAt ?? null,
    endAt: data?.endAt ?? null,

    // ✅ si no existe, asumimos false
    isDeleted: data?.isDeleted ?? false,

    deletedAt: data?.deletedAt ?? null,
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
  // Locale-friendly, short
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
