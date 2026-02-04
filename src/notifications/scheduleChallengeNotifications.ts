import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Challenge } from "@/src/types/challenge";

const KEY = "scheduled_challenge_notifications";

type StoredMap = Record<string, string>;

async function getStored(): Promise<StoredMap> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as StoredMap) : {};
}

async function saveStored(map: StoredMap) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function scheduleChallengeIfNeeded(challenge: Challenge) {
  if (!challenge.startAt) return;

  const startMs = challenge.startAt.toMillis();
  const now = Date.now();

  if (startMs <= now) return;

  const stored = await getStored();

  if (stored[challenge.id]) return;

  const seconds = Math.ceil((startMs - now) / 1000);

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Challenge is live 🔥",
      body: challenge.title,
      data: { challengeId: challenge.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });

  stored[challenge.id] = notifId;
  await saveStored(stored);
}
