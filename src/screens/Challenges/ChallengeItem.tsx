import React from "react";
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
  isDraft: boolean;
  isEnded: boolean;
  isActive?: boolean;
  onActivate: (challenge: Challenge) => void;
  onDelete: (challenge: Challenge) => void;
  onEndNow: (challenge: Challenge) => void;
};

export function ChallengeItem({
  item,
  index,
  isAdmin,
  isDraft,
  isEnded,
  isActive,
  onActivate,
  onDelete,
  onEndNow,
}: ChallengeItemProps) {
  const countdown = useCountdown(item.endAt);

  let bgColor = "#fff";
  if (isDraft) {
    bgColor = "#fff";
  } else {
    bgColor = index % 2 === 0 ? "#97A3C6" : "#B7C6D4";
  }

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
          <Text style={styles.chipText}>{getChallengeStatus(item)}</Text>
        </View>
      </View>

      <Text style={styles.prompt}>{item.prompt}</Text>

      {item.endAt && countdown ? (
        <Text style={styles.countdown}>⏰ {countdown}</Text>
      ) : null}

      {isAdmin ? (
        <View style={styles.adminMeta}>
          <Text style={styles.metaText}>
            Start:{" "}
            {item.startAt ? new Date(item.startAt.toDate()).toLocaleDateString() : "N/A"}
          </Text>
          <Text style={styles.metaText}>
            End: {item.endAt ? new Date(item.endAt.toDate()).toLocaleDateString() : "N/A"}
          </Text>

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
