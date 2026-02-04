import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Challenge } from "@/src/types/challenge";

const KEY = "scheduled_challenge_notifications";

type StoredMap = Record<string, string>;
// challengeId -> notificationId

async function getStored(): Promise<StoredMap> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveStored(map: StoredMap) {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function scheduleChallengeIfNeeded(challenge: Challenge) {
  if (!challenge.startAt) return;

  const startMs = challenge.startAt.toMillis();
  const now = Date.now();

  if (startMs <= now) return; // ya activo

  const stored = await getStored();

  if (stored[challenge.id]) return; // ya programado

  const d = new Date(startMs);

  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Challenge is live 🔥",
      body: challenge.title,
      data: { challengeId: challenge.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
    },
  });

  stored[challenge.id] = notifId;
  await saveStored(stored);
}
