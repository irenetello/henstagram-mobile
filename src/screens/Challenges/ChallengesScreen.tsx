import React, { useMemo } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallengesUser } from "@/src/hooks/useChallengesUser";
import { useChallengesAdmin } from "@/src/hooks/useChallengesAdmin";
import { useIsAdmin } from "@/src/hooks/useIsAdmin";
import { getChallengeStatus, formatMaybeDate } from "@/src/lib/challenges/challengeModel";
import {
  activateChallenge,
  softDeleteChallenge,
} from "@/src/lib/challenges/challengeApi";
import { useAuth } from "@/src/auth/AuthProvider";
import type { Challenge } from "@/src/types/challenge";
import { styles } from "./ChallengesScreen.styles";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const userQuery = useChallengesUser();
  const adminQuery = useChallengesAdmin();

  const { challenges, loading } = isAdmin ? adminQuery : userQuery;

  const title = useMemo(() => (isAdmin ? "Challenges (Admin)" : "Challenges"), [isAdmin]);

  if (loading || adminLoading) {
    return (
      <Screen title={title}>
        <ActivityIndicator style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  const onActivate = (challenge: Challenge) => {
    Alert.alert(
      "Activate challenge?",
      "Pick a duration (or no limit). This sets startAt = now.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "No limit",
          onPress: async () => {
            try {
              await activateChallenge({ challengeId: challenge.id, durationMs: null });
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not activate challenge");
            }
          },
        },
        {
          text: "1 hour",
          onPress: async () => {
            try {
              await activateChallenge({
                challengeId: challenge.id,
                durationMs: 60 * 60 * 1000,
              });
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not activate challenge");
            }
          },
        },
        {
          text: "3 hours",
          onPress: async () => {
            try {
              await activateChallenge({
                challengeId: challenge.id,
                durationMs: 3 * 60 * 60 * 1000,
              });
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not activate challenge");
            }
          },
        },
        {
          text: "24 hours",
          onPress: async () => {
            try {
              await activateChallenge({
                challengeId: challenge.id,
                durationMs: 24 * 60 * 60 * 1000,
              });
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not activate challenge");
            }
          },
        },
        {
          text: "7 days",
          onPress: async () => {
            try {
              await activateChallenge({
                challengeId: challenge.id,
                durationMs: 7 * 24 * 60 * 60 * 1000,
              });
            } catch (e) {
              console.error(e);
              Alert.alert("Error", "Could not activate challenge");
            }
          },
        },
      ],
    );
  };

  const onDelete = (challenge: Challenge) => {
    if (!user) return;
    Alert.alert("Delete challenge?", "This will hide it (soft delete).", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await softDeleteChallenge({
              challengeId: challenge.id,
              deletedByUid: user.uid,
            });
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not delete challenge");
          }
        },
      },
    ]);
  };

  return (
    <Screen title={title}>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/challenge/[id]",
                params: { id: item.id },
              })
            }
          >
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{item.title}</Text>
              {isAdmin ? (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{getChallengeStatus(item)}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.prompt}>{item.prompt}</Text>

            {isAdmin ? (
              <View style={styles.adminMeta}>
                <Text style={styles.metaText}>
                  Start: {formatMaybeDate(item.startAt)}
                </Text>
                <Text style={styles.metaText}>End: {formatMaybeDate(item.endAt)}</Text>

                <View style={styles.adminActions}>
                  {getChallengeStatus(item) === "DRAFT" ? (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => onActivate(item)}
                    >
                      <Text style={styles.actionText}>Activate</Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(item)}
                  >
                    <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}
