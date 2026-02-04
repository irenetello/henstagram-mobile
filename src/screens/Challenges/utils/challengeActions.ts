import { Alert } from "react-native";
import type { Challenge } from "@/src/types/challenge";
import {
  activateChallenge,
  softDeleteChallenge,
  endChallengeNow,
} from "@/src/lib/challenges/challengeApi";

export async function handleActivate(challenge: Challenge, durationMs: number | null) {
  try {
    await activateChallenge({ challengeId: challenge.id, durationMs });
  } catch (e) {
    console.error(e);
    Alert.alert("Error", "Could not activate challenge");
  }
}

export function handleDelete(
  challenge: Challenge,
  userUid: string,
  onDelete: (challengeId: string) => void,
) {
  Alert.alert("Delete challenge?", "This action will not delete the challenges posts", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await softDeleteChallenge({
            challengeId: challenge.id,
            deletedByUid: userUid,
          });
          onDelete(challenge.id);
        } catch (e) {
          console.error(e);
          Alert.alert("Error", "Could not delete challenge");
        }
      },
    },
  ]);
}

export function handleEndNow(
  challenge: Challenge,
  optimisticEndNow?: (challengeId: string) => void,
) {
  Alert.alert(
    "End challenge now?",
    "This will end the challenge immediately. Existing posts will remain.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "End now",
        style: "destructive",
        onPress: async () => {
          try {
            optimisticEndNow?.(challenge.id);
            await endChallengeNow({ challengeId: challenge.id });
          } catch (e: any) {
            console.error("FIRESTORE ENDNOW FAILED:", e?.code, e?.message, e);
            Alert.alert("Error", `${e?.code ?? "unknown"}: ${e?.message ?? "failed"}`);
          }
        },
      },
    ],
  );
}

export const ACTIVATE_OPTIONS = [
  { label: "No limit", durationMs: null as number | null },
  { label: "1 hour", durationMs: 60 * 60 * 1000 },
  { label: "3 hours", durationMs: 3 * 60 * 60 * 1000 },
  { label: "24 hours", durationMs: 24 * 60 * 60 * 1000 },
  { label: "7 days", durationMs: 7 * 24 * 60 * 60 * 1000 },
];
