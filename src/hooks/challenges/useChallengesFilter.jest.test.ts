/// <reference types="jest" />

import { act, renderHook } from "@testing-library/react-native";
import { useChallengesFilter } from "./useChallengesFilter";

jest.mock("@/src/lib/challenges/challengeModel", () => ({
  getChallengeStatus: jest.fn((challenge: any) => challenge._status),
}));

describe("useChallengesFilter", () => {
  const rawChallenges: any[] = [
    { id: "d1", _status: "DRAFT" },
    { id: "a1", _status: "ACTIVE" },
    { id: "e1", _status: "ENDED" },
  ];

  it("admin mode all returns all raw challenges", () => {
    const { result } = renderHook(() => useChallengesFilter(rawChallenges as any, true));

    expect(result.current.challenges.map((c: any) => c.id)).toEqual(["d1", "a1", "e1"]);
  });

  it("admin drafts filter returns only drafts", () => {
    const { result } = renderHook(() => useChallengesFilter(rawChallenges as any, true));

    act(() => {
      result.current.setAdminFilter("drafts");
    });

    expect(result.current.challenges.map((c: any) => c.id)).toEqual(["d1"]);
  });

  it("user mode excludes drafts and applies active/ended filters", () => {
    const { result } = renderHook(() => useChallengesFilter(rawChallenges as any, false));

    expect(result.current.challenges.map((c: any) => c.id)).toEqual(["a1"]);

    act(() => {
      result.current.setUserFilter("ended");
    });
    expect(result.current.challenges.map((c: any) => c.id)).toEqual(["e1"]);

    act(() => {
      result.current.setUserFilter("all");
    });
    expect(result.current.challenges.map((c: any) => c.id)).toEqual(["a1", "e1"]);
  });
});
