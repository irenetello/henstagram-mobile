import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";
import { formatMaybeDate, getChallengeStatus, mapChallenge } from "./challengeModel";

describe("getChallengeStatus", () => {
  it("returns DRAFT when startAt is missing", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    expect(getChallengeStatus({ startAt: null, endAt: null }, now)).toBe("DRAFT");
  });

  it("returns DRAFT when startAt is in the future", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    const startAt = new Date("2026-01-01T12:00:00.000Z") as any;
    expect(getChallengeStatus({ startAt, endAt: null }, now)).toBe("DRAFT");
  });

  it("returns ACTIVE when started and no endAt", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    const startAt = new Date("2026-01-01T09:00:00.000Z") as any;
    expect(getChallengeStatus({ startAt, endAt: null }, now)).toBe("ACTIVE");
  });

  it("returns ENDED when endAt <= now", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    const startAt = new Date("2026-01-01T09:00:00.000Z") as any;
    const endAt = new Date("2026-01-01T10:00:00.000Z") as any;
    expect(getChallengeStatus({ startAt, endAt }, now)).toBe("ENDED");
  });

  it("returns ACTIVE when endAt > now", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    const startAt = new Date("2026-01-01T09:00:00.000Z") as any;
    const endAt = new Date("2026-01-01T10:30:00.000Z") as any;
    expect(getChallengeStatus({ startAt, endAt }, now)).toBe("ACTIVE");
  });

  it("supports firestore-like timestamps with toMillis", () => {
    const now = new Date("2026-01-01T10:00:00.000Z") as any;
    const startAt = { toMillis: () => new Date("2026-01-01T09:00:00.000Z").getTime() };
    const endAt = { toMillis: () => new Date("2026-01-01T11:00:00.000Z").getTime() };
    expect(
      getChallengeStatus({ startAt: startAt as any, endAt: endAt as any }, now),
    ).toBe("ACTIVE");
  });
});

describe("mapChallenge", () => {
  it("maps and normalizes defaults when fields are missing", () => {
    const challenge = mapChallenge("c1", {});

    expect(challenge.id).toBe("c1");
    expect(challenge.title).toBe("");
    expect(challenge.prompt).toBe("");
    expect(challenge.createdByUid).toBe("");
    expect(challenge.createdByName).toBeNull();
    expect(challenge.startAt).toBeNull();
    expect(challenge.endAt).toBeNull();
    expect(challenge.isDeleted).toBe(false);
    expect(challenge.deletedAt).toBeNull();
    expect(challenge.deletedByUid).toBeNull();
    expect(challenge.coverImageUrl).toBeNull();
    expect(challenge.createdAt).toBeInstanceOf(Timestamp);
  });

  it("supports Date, toDate, toMillis, seconds/nanoseconds and Timestamp inputs", () => {
    const startAtDate = new Date("2026-01-01T09:00:00.000Z");
    const createdAtToDate = { toDate: () => new Date("2026-01-01T08:00:00.000Z") };
    const endAtToMillis = {
      toMillis: () => new Date("2026-01-01T10:00:00.000Z").getTime(),
    };
    const deletedAtSeconds = { seconds: 1760000000, nanoseconds: 0 };
    const directTimestamp = Timestamp.fromDate(new Date("2026-01-01T07:00:00.000Z"));

    const challenge = mapChallenge("c2", {
      title: "T",
      prompt: "P",
      createdByUid: "u",
      createdByName: "name",
      startAt: startAtDate,
      createdAt: createdAtToDate,
      endAt: endAtToMillis,
      deletedAt: deletedAtSeconds,
      coverImageUrl: "https://img",
      isDeleted: true,
      deletedByUid: "admin",
    });

    expect(challenge.startAt).toBeInstanceOf(Timestamp);
    expect(challenge.createdAt).toBeInstanceOf(Timestamp);
    expect(challenge.endAt).toBeInstanceOf(Timestamp);
    expect(challenge.deletedAt).toBeInstanceOf(Timestamp);
    expect(challenge.title).toBe("T");
    expect(challenge.createdByName).toBe("name");
    expect(challenge.deletedByUid).toBe("admin");

    const challengeWithTimestamp = mapChallenge("c3", {
      createdAt: directTimestamp,
    });

    expect(challengeWithTimestamp.createdAt).toBe(directTimestamp);
  });

  it("returns null for unknown timestamp-like values", () => {
    const challenge = mapChallenge("c4", {
      startAt: { foo: "bar" },
      endAt: { any: true },
      deletedAt: { nope: 1 },
    });

    expect(challenge.startAt).toBeNull();
    expect(challenge.endAt).toBeNull();
    expect(challenge.deletedAt).toBeNull();
  });
});

describe("formatMaybeDate", () => {
  it("returns dash for empty values", () => {
    expect(formatMaybeDate(null)).toBe("—");
    expect(formatMaybeDate(undefined)).toBe("—");
  });

  it("formats values from number, Date, toDate and toMillis", () => {
    const asNumber = formatMaybeDate(new Date("2026-01-01T10:00:00.000Z").getTime());
    const asDate = formatMaybeDate(new Date("2026-01-01T10:00:00.000Z"));
    const asToDate = formatMaybeDate({
      toDate: () => new Date("2026-01-01T10:00:00.000Z"),
    });
    const asToMillis = formatMaybeDate({
      toMillis: () => new Date("2026-01-01T10:00:00.000Z").getTime(),
    });

    expect(asNumber).not.toBe("—");
    expect(asDate).not.toBe("—");
    expect(asToDate).not.toBe("—");
    expect(asToMillis).not.toBe("—");
  });

  it("returns dash for unsupported non-empty values", () => {
    expect(formatMaybeDate("invalid-date-shape" as any)).toBe("—");
  });
});
