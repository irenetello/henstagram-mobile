import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/src/components/useColorScheme";
import SpaceMonoFont from "../assets/fonts/SpaceMono-Regular.ttf";
import { AuthProvider, useAuth } from "@/src/auth/AuthProvider";
import { NotificationTapHandler } from "@/src/notifications/NotificationTapHandler";

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
  const segments = useSegments() as string[];
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (initializing) return;

    const inLogin = segments.includes("login");

    if (!user && !inLogin) {
      router.replace("/login");
      return;
    }
    if (user && inLogin) {
      router.replace("/(tabs)/feed");
      return;
    }
  }, [user, initializing, segments, router]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <NotificationTapHandler />
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="challenge/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="challenge/create" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
