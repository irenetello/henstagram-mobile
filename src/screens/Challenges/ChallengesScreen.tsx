import React, { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallengesUser } from "@/src/hooks/useChallengesUser";
import { useChallengesAdmin } from "@/src/hooks/useChallengesAdmin";
import { useIsAdmin } from "@/src/hooks/useIsAdmin";
import { getChallengeStatus } from "@/src/lib/challenges/challengeModel";
import {
  activateChallenge,
  softDeleteChallenge,
} from "@/src/lib/challenges/challengeApi";
import { useAuth } from "@/src/auth/AuthProvider";
import type { Challenge } from "@/src/types/challenge";
import { styles } from "./ChallengesScreen.styles";
import { ChallengeItem } from "./ChallengeItem";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const userQuery = useChallengesUser();
  const adminQuery = useChallengesAdmin();

  const [showAdminMode, setShowAdminMode] = useState(true);
  const [adminFilter, setAdminFilter] = useState<"all" | "drafts">("all");

  const { challenges: rawChallenges, loading } = isAdmin ? adminQuery : userQuery;

  const challenges = useMemo(() => {
    if (isAdmin && !showAdminMode) {
      return rawChallenges.filter((c) => getChallengeStatus(c) !== "DRAFT");
    }
    if (isAdmin && showAdminMode && adminFilter === "drafts") {
      return rawChallenges.filter((c) => getChallengeStatus(c) === "DRAFT");
    }
    return rawChallenges;
  }, [isAdmin, showAdminMode, rawChallenges, adminFilter]);

  const title = useMemo(
    () => (isAdmin && showAdminMode ? "Challenges (Admin)" : "Challenges"),
    [isAdmin, showAdminMode],
  );

  const [activateOpen, setActivateOpen] = useState(false);
  const [activateTarget, setActivateTarget] = useState<Challenge | null>(null);

  const activateOptions = [
    { label: "No limit", durationMs: null as number | null },
    { label: "1 hour", durationMs: 60 * 60 * 1000 },
    { label: "3 hours", durationMs: 3 * 60 * 60 * 1000 },
    { label: "24 hours", durationMs: 24 * 60 * 60 * 1000 },
    { label: "7 days", durationMs: 7 * 24 * 60 * 60 * 1000 },
  ];

  const activateWith = async (challenge: Challenge, durationMs: number | null) => {
    try {
      await activateChallenge({ challengeId: challenge.id, durationMs });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not activate challenge");
    }
  };

  if (loading || adminLoading) {
    return (
      <Screen title={title}>
        <ActivityIndicator style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  const onActivate = (challenge: Challenge) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Activate challenge?",
          message: "Pick a duration (or no limit).",
          options: ["Cancel", ...activateOptions.map((o) => o.label)],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const selected = activateOptions[buttonIndex - 1];
          if (selected) activateWith(challenge, selected.durationMs);
        },
      );
      return;
    }

    setActivateTarget(challenge);
    setActivateOpen(true);
  };

  const onDelete = (challenge: Challenge) => {
    if (!user) return;
    Alert.alert("Delete challenge?", "This action will not delete the challenges posts", [
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
    <Screen
      title={title}
      headerRight={
        isAdmin ? (
          <Pressable
            onPress={() => setShowAdminMode((prev) => !prev)}
            style={{
              paddingHorizontal: 4,
              backgroundColor: "rgb(214, 229, 234)",
              borderRadius: 8,
              padding: 4,
            }}
          >
            <Text style={{ fontWeight: "700", fontSize: 16 }}>
              {showAdminMode ? "👤 User" : "⚙️ Admin"}
            </Text>
          </Pressable>
        ) : undefined
      }
    >
      {isAdmin && showAdminMode ? (
        <View style={styles.filterTabs}>
          <Pressable
            onPress={() => setAdminFilter("all")}
            style={[styles.filterTab, adminFilter === "all" && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                adminFilter === "all" && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setAdminFilter("drafts")}
            style={[styles.filterTab, adminFilter === "drafts" && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                adminFilter === "drafts" && styles.filterTabTextActive,
              ]}
            >
              Drafts
            </Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isDraft = getChallengeStatus(item) === "DRAFT";
          const isEnded = getChallengeStatus(item) === "ENDED";

          return (
            <ChallengeItem
              item={item}
              index={index}
              isAdmin={isAdmin && showAdminMode}
              isDraft={isDraft}
              isEnded={isEnded}
              onActivate={onActivate}
              onDelete={onDelete}
            />
          );
        }}
      />

      <Modal
        visible={activateOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setActivateOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
          onPress={() => setActivateOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: "white",
              padding: 12,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
            }}
            onPress={() => null}
          >
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 6 }}>
              Activate challenge?
            </Text>
            <Text style={{ opacity: 0.7, marginBottom: 8 }}>
              Pick a duration (or no limit).
            </Text>

            {activateOptions.map((o) => (
              <Pressable
                key={o.label}
                style={{ paddingVertical: 12 }}
                onPress={async () => {
                  if (!activateTarget) return;
                  await activateWith(activateTarget, o.durationMs);
                  setActivateOpen(false);
                }}
              >
                <Text style={{ fontWeight: "600" }}>{o.label}</Text>
              </Pressable>
            ))}

            <Pressable
              style={{ paddingVertical: 12 }}
              onPress={() => setActivateOpen(false)}
            >
              <Text style={{ fontWeight: "600" }}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
