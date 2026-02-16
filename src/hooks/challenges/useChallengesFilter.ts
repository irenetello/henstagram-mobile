import { useMemo, useState } from "react";
import type { Challenge } from "@/src/types/challenge";
import { getChallengeStatus } from "@/src/lib/challenges/challengeModel";

export function useChallengesFilter(rawChallenges: Challenge[], isAdmin: boolean) {
  const [showAdminMode, setShowAdminMode] = useState(true);
  const [adminFilter, setAdminFilter] = useState<"all" | "drafts">("all");
  const [userFilter, setUserFilter] = useState<"all" | "active" | "ended">("active");

  const challenges = useMemo(() => {
    if (isAdmin && showAdminMode) {
      if (adminFilter === "drafts") {
        return rawChallenges.filter((c) => getChallengeStatus(c) === "DRAFT");
      }
      return rawChallenges;
    }

    let filtered = rawChallenges.filter((c) => getChallengeStatus(c) !== "DRAFT");

    if (userFilter === "active") {
      filtered = filtered.filter((c) => getChallengeStatus(c) === "ACTIVE");
    } else if (userFilter === "ended") {
      filtered = filtered.filter((c) => getChallengeStatus(c) === "ENDED");
    }

    return filtered;
  }, [isAdmin, showAdminMode, rawChallenges, adminFilter, userFilter]);

  return {
    challenges,
    showAdminMode,
    setShowAdminMode,
    adminFilter,
    setAdminFilter,
    userFilter,
    setUserFilter,
  };
}
