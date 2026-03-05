import React, { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import type { Href } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallengesUser } from "@/src/hooks/challenges/useChallengesUser";
import { useChallengesAdmin } from "@/src/hooks/challenges/useChallengesAdmin";
import { useIsAdmin } from "@/src/hooks/user/useIsAdmin";
import { useAuth } from "@/src/auth/AuthProvider";
import type { Challenge } from "@/src/types/challenge";
import { styles } from "./ChallengesScreen.styles";
import { ChallengeItem } from "./ChallengeItem";
import { useChallengesFilter } from "../../hooks/challenges/useChallengesFilter";
import {
  handleActivate,
  handleDelete,
  handleEndNow,
  ACTIVATE_OPTIONS,
} from "./utils/challengeActions";
import { FilterTabs } from "../../components/Challenges/FilterTabs";
import { AdminModeButton } from "../../components/Challenges/AdminModeButton";
import { ActivateModal } from "../../components/Challenges/ActivateModal";
import { useMinigamesEnabled } from "@/src/hooks/features/useMinigamesEnabled";
import { useAppLaunchEnabled } from "@/src/hooks/features/useAppLaunchEnabled";
import {
  setAppLaunched,
  setMinigamesEnabled,
} from "@/src/lib/features/minigamesFeatureApi";

const SUPER_ADMIN_EMAIL = "irenetelloacedo.info@gmail.com";

export default function ChallengesScreen() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const userQuery = useChallengesUser();
  const adminQuery = useChallengesAdmin();

  const {
    challenges: rawChallenges,
    loading,
    optimisticEndNow,
  } = isAdmin ? adminQuery : (userQuery as any);

  const {
    challenges,
    showAdminMode,
    setShowAdminMode,
    adminFilter,
    setAdminFilter,
    userFilter,
    setUserFilter,
  } = useChallengesFilter(rawChallenges, isAdmin);

  const title = isAdmin && showAdminMode ? "Challenges (Admin)" : "Challenges";

  const [activateOpen, setActivateOpen] = useState(false);
  const [activateTarget, setActivateTarget] = useState<Challenge | null>(null);
  const { enabled: minigamesEnabled, loading: minigamesLoading } = useMinigamesEnabled();
  const { enabled: appLaunched, loading: appLaunchedLoading } = useAppLaunchEnabled();
  const [updatingMinigames, setUpdatingMinigames] = useState(false);
  const [updatingLaunch, setUpdatingLaunch] = useState(false);
  const isSuperAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

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
          options: ["Cancel", ...ACTIVATE_OPTIONS.map((o) => o.label)],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const selected = ACTIVATE_OPTIONS[buttonIndex - 1];
          if (selected) handleActivate(challenge, selected.durationMs);
        },
      );
      return;
    }

    setActivateTarget(challenge);
    setActivateOpen(true);
  };

  const onDelete = (challenge: Challenge) => {
    if (!user) return;
    handleDelete(challenge, user.uid, (_challengeId) => {
      // Optionally update UI after delete
    });
  };

  const onEndNow = (challenge: Challenge) => {
    handleEndNow(challenge, optimisticEndNow);
  };

  return (
    <Screen
      title={title}
      headerRight={
        isAdmin ? (
          <AdminModeButton
            isAdminMode={showAdminMode}
            onToggle={() => setShowAdminMode(!showAdminMode)}
          />
        ) : undefined
      }
    >
      {isAdmin && showAdminMode ? (
        <>
          <View style={styles.featureToggleRow}>
            <Pressable
              style={[styles.featureToggleButton, styles.featureToggleButtonInline]}
              onPress={() => {
                if (updatingMinigames || minigamesLoading) return;
                const nextEnabled = !minigamesEnabled;

                Alert.alert(
                  nextEnabled ? "Enable Bingo tab?" : "Disable Bingo tab?",
                  nextEnabled
                    ? "Are you sure you want to enable the Bingo tab for users?"
                    : "Are you sure you want to disable the Bingo tab for users?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: nextEnabled ? "Enable" : "Disable",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          setUpdatingMinigames(true);
                          await setMinigamesEnabled(nextEnabled);
                        } finally {
                          setUpdatingMinigames(false);
                        }
                      },
                    },
                  ],
                );
              }}
              disabled={updatingMinigames || minigamesLoading}
            >
              <Text style={styles.featureToggleText}>
                {updatingMinigames || minigamesLoading
                  ? "Updating Bingo…"
                  : `🎯 Bingo: ${minigamesEnabled ? "ON" : "OFF"}`}
              </Text>
            </Pressable>

            {isSuperAdmin ? (
              <Pressable
                style={[styles.featureToggleButton, styles.featureToggleButtonInline]}
                onPress={() => {
                  if (updatingLaunch || appLaunchedLoading) return;
                  const nextEnabled = !appLaunched;

                  Alert.alert(
                    nextEnabled ? "Launch app for users?" : "Hide app from users?",
                    nextEnabled
                      ? "Are you sure you want to launch the app for all non-admin users?"
                      : "Are you sure you want to hide the app for all non-admin users?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: nextEnabled ? "Launch" : "Hide",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            setUpdatingLaunch(true);
                            await setAppLaunched(nextEnabled);
                          } finally {
                            setUpdatingLaunch(false);
                          }
                        },
                      },
                    ],
                  );
                }}
                disabled={updatingLaunch || appLaunchedLoading}
              >
                <Text style={styles.featureToggleText}>
                  {updatingLaunch || appLaunchedLoading
                    ? "Updating Launch…"
                    : `🚀 Launch: ${appLaunched ? "ON" : "OFF"}`}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/challenge/create" as Href)}
          >
            <Text style={styles.createButtonText}>➕ New Challenge</Text>
          </Pressable>

          <FilterTabs
            filters={[
              { label: "All", value: "all" },
              { label: "Drafts", value: "drafts" },
            ]}
            activeFilter={adminFilter}
            onFilterChange={(value) => setAdminFilter(value as "all" | "drafts")}
          />
        </>
      ) : null}

      {!isAdmin || !showAdminMode ? (
        <FilterTabs
          filters={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Ended", value: "ended" },
          ]}
          activeFilter={userFilter}
          onFilterChange={(value) => setUserFilter(value as "all" | "active" | "ended")}
        />
      ) : null}

      <FlatList
        data={challenges}
        keyExtractor={(item) =>
          `${item.id}-${typeof item?.endAt?.toMillis === "function" ? item.endAt.toMillis() : "noend"}`
        }
        extraData={challenges
          .map(
            (c: Challenge) =>
              `${c.id}:${typeof c?.endAt?.toMillis === "function" ? c.endAt.toMillis() : "noend"}`,
          )
          .join("|")}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <ChallengeItem
            item={item}
            index={index}
            isAdmin={isAdmin && showAdminMode}
            onActivate={onActivate}
            onEndNow={onEndNow}
            onDelete={onDelete}
          />
        )}
      />

      <ActivateModal
        visible={activateOpen}
        target={activateTarget}
        onClose={() => setActivateOpen(false)}
        onConfirm={(durationMs) => {
          if (!activateTarget) return Promise.resolve();
          return handleActivate(activateTarget, durationMs);
        }}
      />
    </Screen>
  );
}
