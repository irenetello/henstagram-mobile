import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

type PushData = {
  challengeId?: string;
  id?: string;
};

export function NotificationTapHandler() {
  const router = useRouter();

  useEffect(() => {
    const handle = (data: PushData | undefined) => {
      if (!data) return;

      const id = data.challengeId ?? data.id;
      if (!id) return;

      router.push(`/challenge/${id}`);
    };

    // App abierta / en background → usuario toca notificación
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as PushData;
      handle(data);
    });

    // App cerrada → se abrió desde notificación
    (async () => {
      const last = await Notifications.getLastNotificationResponseAsync();
      const data = last?.notification.request.content.data as PushData | undefined;
      handle(data);
    })();

    return () => sub.remove();
  }, [router]);

  return null;
}
