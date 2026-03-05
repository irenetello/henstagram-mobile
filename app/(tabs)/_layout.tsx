import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

import CreateScreen from "./create";
import FeedScreen from "./feed";
import ProfileScreen from "./profile";

import { BottomTabBar } from "@/src/components/BottomTabBar";
import ChallengesScreen from "./challenges";
import { useCreateDraftStore } from "@/src/store/createDraftStore";
import OurHistoryScreen from "./memories";
import { onTabRequest } from "@/src/lib/tabs/tabBus";
import MiniGamesScreen from "./minigames";
import { useMinigamesEnabled } from "@/src/hooks/features/useMinigamesEnabled";

type TabKey = "feed" | "create" | "challenges" | "minigames" | "ourHistory" | "profile";

const TAB_ORDER_WITH_MINIGAMES: TabKey[] = [
  "feed",
  "create",
  "challenges",
  "minigames",
  "ourHistory",
  "profile",
];

const TAB_ORDER_DEFAULT: TabKey[] = [
  "feed",
  "create",
  "challenges",
  "ourHistory",
  "profile",
];

export default function TabsLayout() {
  const pagerRef = useRef<PagerView>(null);
  const { enabled: minigamesEnabled } = useMinigamesEnabled();
  const tabOrder = useMemo(
    () => (minigamesEnabled ? TAB_ORDER_WITH_MINIGAMES : TAB_ORDER_DEFAULT),
    [minigamesEnabled],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = useMemo(
    () => tabOrder[activeIndex] ?? "feed",
    [tabOrder, activeIndex],
  );
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const draftImage = useCreateDraftStore((s) => s.imageUri);
  const draftCaption = useCreateDraftStore((s) => s.caption);
  const isCaptionFocused = useCreateDraftStore((s) => s.isCaptionFocused);
  const isDraftDirty = !!draftImage || draftCaption.trim().length > 0;

  const activeTabRef = useRef(activeTab);
  const isDraftDirtyRef = useRef(isDraftDirty);
  const tabOrderRef = useRef(tabOrder);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    tabOrderRef.current = tabOrder;
  }, [tabOrder]);

  useEffect(() => {
    if (activeIndex < tabOrder.length) return;
    const nextIndex = Math.max(0, tabOrder.length - 1);
    setActiveIndex(nextIndex);
    requestAnimationFrame(() => {
      pagerRef.current?.setPage(nextIndex);
    });
  }, [activeIndex, tabOrder.length]);

  useEffect(() => {
    if (activeTab === "minigames" && !minigamesEnabled) {
      setActiveIndex(0);
      requestAnimationFrame(() => {
        pagerRef.current?.setPage(0);
      });
    }
  }, [activeTab, minigamesEnabled]);

  useEffect(() => {
    isDraftDirtyRef.current = isDraftDirty;
  }, [isDraftDirty]);

  const resetDraft = useCreateDraftStore((s) => s.resetDraft);
  const isSwipeEnabled = !(
    activeTab === "create" &&
    (isKeyboardOpen || isCaptionFocused || isDraftDirty)
  );

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setIsKeyboardOpen(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setIsKeyboardOpen(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const unsub = onTabRequest((tab) => {
      const index = tabOrderRef.current.indexOf(tab);
      if (index < 0) return;

      if (
        activeTabRef.current === "create" &&
        isDraftDirtyRef.current &&
        tab !== "create"
      ) {
        Keyboard.dismiss();
        Alert.alert(
          "Discard draft?",
          "If you leave, your photo and caption will be cleared.",
          [
            { text: "Stay", style: "cancel" },
            {
              text: "Discard",
              style: "destructive",
              onPress: () => {
                resetDraft();
                setActiveIndex(index);
                requestAnimationFrame(() => {
                  pagerRef.current?.setPage(index);
                });
              },
            },
          ],
        );
        return;
      }

      setActiveIndex(index);
      requestAnimationFrame(() => {
        pagerRef.current?.setPage(index);
      });
    });

    return unsub;
  }, []);

  const goTo = (tab: TabKey) => {
    if (tab === activeTab) return;

    const leavingCreateWithDraft = activeTab === "create" && isDraftDirty;

    if (leavingCreateWithDraft) {
      Keyboard.dismiss();
      Alert.alert(
        "Discard draft?",
        "If you leave, your photo and caption will be cleared.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              resetDraft();
              const index = tabOrder.indexOf(tab);
              if (index < 0) return;
              setActiveIndex(index);
              requestAnimationFrame(() => {
                pagerRef.current?.setPage(index);
              });
            },
          },
        ],
      );
      return;
    }

    const index = tabOrder.indexOf(tab);
    if (index < 0) return;
    setActiveIndex(index);
    requestAnimationFrame(() => {
      pagerRef.current?.setPage(index);
    });
  };

  const renderTabPage = (tab: TabKey) => {
    switch (tab) {
      case "feed":
        return (
          <View key="feed" style={styles.page}>
            <FeedScreen />
          </View>
        );
      case "create":
        return (
          <View key="create" style={styles.page}>
            <CreateScreen />
          </View>
        );
      case "challenges":
        return (
          <View key="challenges" style={styles.page}>
            <ChallengesScreen />
          </View>
        );
      case "minigames":
        return (
          <View key="minigames" style={styles.page}>
            <MiniGamesScreen />
          </View>
        );
      case "ourHistory":
        return (
          <View key="ourHistory" style={styles.page}>
            <OurHistoryScreen />
          </View>
        );
      case "profile":
        return (
          <View key="profile" style={styles.page}>
            <ProfileScreen />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={isSwipeEnabled}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        {tabOrder.map(renderTabPage)}
      </PagerView>

      <SafeAreaView edges={["bottom"]} style={styles.safeBottom}>
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={goTo}
          showMinigames={minigamesEnabled}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  pager: { flex: 1 },
  page: { flex: 1 },
  safeBottom: { backgroundColor: "#fff" },
});
