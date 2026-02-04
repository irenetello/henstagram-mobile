import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { useCountdown } from "@/src/hooks/useCountdown";
import { getChallengeStatus } from "@/src/lib/challenges/challengeModel";
import { styles } from "./ChallengesScreen.styles";
import type { Challenge } from "@/src/types/challenge";

type ChallengeItemProps = {
  item: Challenge;
  index: number;
  isAdmin: boolean;
  onActivate: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
  onEndNow: (challenge: Challenge) => void;
};

function formatDateTime(ts: any): string {
  if (!ts) return "N/A";
  const d =
    typeof ts?.toDate === "function" ? ts.toDate() : ts instanceof Date ? ts : null;
  if (!d) return "N/A";
  return d.toLocaleString([], { hour: "2-digit", minute: "2-digit" });
}

function useNowTick(enabled: boolean, ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [enabled, ms]);
  return now;
}

export function ChallengeItem({
  item,
  index,
  isAdmin,
  onActivate,
  onDelete,
  onEndNow,
}: ChallengeItemProps) {
  const countdown = useCountdown(item.endAt);
  const now = useNowTick(true, 1000);
  const status = getChallengeStatus(item, now);
  const isDraft = status === "DRAFT";
  const isEnded = status === "ENDED";
  const isActive = status === "ACTIVE";

  const bgColor = useMemo(() => {
    if (isDraft) return "#fff";
    return index % 2 === 0 ? "#97A3C6" : "#B7C6D4";
  }, [index, isDraft]);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: bgColor, opacity: isEnded ? 0.3 : 1 }]}
      onPress={() =>
        router.push({
          pathname: "/challenge/[id]",
          params: { id: item.id },
        })
      }
    >
      <View style={styles.rowBetween}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.chip}>
          <Text style={styles.chipText}>{status}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>{item.prompt}</Text>

      {item.endAt && countdown ? (
        <Text style={styles.countdown}>⏰ {countdown}</Text>
      ) : null}

      {isAdmin ? (
        <View style={styles.adminMeta}>
          <Text style={styles.metaText}>Start: {formatDateTime(item.startAt)}</Text>
          <Text style={styles.metaText}>End: {formatDateTime(item.endAt)}</Text>

          <View style={styles.adminActions}>
            {isDraft ? (
              <Pressable style={styles.actionButton} onPress={() => onActivate(item)}>
                <Text style={styles.actionText}>Activate</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(item)}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </Pressable>

            {isActive ? (
              <Pressable
                onPress={() => onEndNow(item)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.endText}>End now</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
