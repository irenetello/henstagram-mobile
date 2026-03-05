import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "@/src/lib/firebase";

export function useAppLaunchEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [welcomeImageUrl, setWelcomeImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ref = doc(db, "appConfig", "features");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const rawData = snap.data() as Record<string, unknown> | undefined;
        const appLaunched = rawData?.appLaunched;
        const welcomeImage = rawData?.welcomeImageUrl;

        setEnabled(Boolean(appLaunched));
        setWelcomeImageUrl(
          typeof welcomeImage === "string" && welcomeImage.trim().length > 0
            ? welcomeImage
            : undefined,
        );
        setLoading(false);
      },
      () => {
        setEnabled(false);
        setWelcomeImageUrl(undefined);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return { enabled, loading, welcomeImageUrl };
}
