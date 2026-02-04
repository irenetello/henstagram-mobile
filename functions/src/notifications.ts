const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: Record<string, unknown>;
};

type ExpoPushResponse = {
  data?: ExpoPushTicket[];
  errors?: unknown[];
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function safeReadJson(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) {
    console.log("[push] no messages to send");
    return;
  }

  const batches = chunk(messages, 100);

  for (const batch of batches) {
    console.log(`[push] sending batch of ${batch.length}`);

    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(batch),
    });

    const json = (await safeReadJson(res)) as ExpoPushResponse | null;

    // HTTP no OK
    if (!res.ok) {
      const textFallback = await safeReadText(res);
      throw new Error(
        `[push] Expo HTTP error ${res.status}: ${
          json ? JSON.stringify(json) : textFallback
        }`,
      );
    }

    // OK, pero puede haber errores a nivel de ticket
    const tickets = json?.data ?? [];
    if (!tickets.length) {
      console.warn("[push] unexpected Expo response (no data):", json);
      continue;
    }

    const errors = tickets.filter((t) => t.status === "error");
    if (errors.length) {
      console.error("[push] Expo ticket errors:", errors);

      // Si prefieres que esto rompa el flujo (y falle la function), descomenta:
      // throw new Error(`[push] Expo ticket errors: ${JSON.stringify(errors)}`);
    } else {
      console.log("[push] batch accepted by Expo");
    }
  }
}
