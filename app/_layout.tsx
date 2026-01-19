import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/src/lib/auth";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLogged, setIsLogged] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsLogged(!!user);
      setAuthChecked(true);
      SplashScreen.hideAsync().catch(() => {});
    });
    return unsub;
  }, []);

  if (!authChecked) return null;

  return (
    <Stack>
      {/* si no está logueada, el stack SOLO enseña login */}
      {!isLogged ? (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
