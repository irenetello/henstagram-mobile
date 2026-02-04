import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Challenge } from "@/src/types/challenge";

const KEY = "scheduled_challenge_notifications";

type StoredMap = Record<string, string>;

async function getStored(): Promise<StoredMap> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveStored(map: StoredMap) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

async function cancelIfExists(challengeId: string, stored: StoredMap) {
  const existing = stored[challengeId];
  if (!existing) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(existing);
  } catch (e) {
    console.warn("cancel failed", e);
  }

  delete stored[challengeId];
}

export async function scheduleChallengeIfNeeded(challenge: Challenge) {
  const stored = await getStored();

  if (!challenge.startAt) {
    await cancelIfExists(challenge.id, stored);
    await saveStored(stored);
    return;
  }

  const startMs = challenge.startAt.toMillis();
  const now = Date.now();

  if (startMs <= now) {
    await cancelIfExists(challenge.id, stored);
    await saveStored(stored);
    return;
  }

  await cancelIfExists(challenge.id, stored);

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
