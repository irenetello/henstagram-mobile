import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import SpaceMonoFont from "../assets/fonts/SpaceMono-Regular.ttf";
import { AuthProvider, useAuth } from "@/src/auth/AuthProvider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: SpaceMonoFont,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;

    const inLogin = segments[0] === "login";
    const inTabs = segments[0] === "(tabs)";

    // No session → fuera de tabs, a login
    if (!user && !inLogin) {
      router.replace("/login");
      return;
    }

    // Con session → si estás en login, te saco a la app
    if (user && inLogin) {
      router.replace("/(tabs)/feed");
      return;
    }

    // si no estás en tabs y estás logueada, opcionalmente podrías empujar a tabs:
    // if (user && !inTabs) router.replace("/(tabs)/feed");
  }, [user, initializing, segments, router]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* OJO: si no existe app/modal.tsx, esto sobra (lo retomamos luego) */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
