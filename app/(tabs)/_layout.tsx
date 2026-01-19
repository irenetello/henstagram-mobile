import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, StyleSheet, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

import CreateScreen from "./create";
import FeedScreen from "./feed";
import ProfileScreen from "./profile";

import { BottomTabBar } from "@/components/BottomTabBar";
import ChallengesScreen from "./challenges";
import { useCreateDraftStore } from "@/src/store/createDraftStore";

type TabKey = "feed" | "create" | "challenges" | "profile";

const TAB_ORDER: TabKey[] = ["feed", "create", "challenges", "profile"];

export default function TabsLayout() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = useMemo(() => TAB_ORDER[activeIndex], [activeIndex]);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const draftImage = useCreateDraftStore((s) => s.imageUri);
  const draftCaption = useCreateDraftStore((s) => s.caption);
  const isCaptionFocused = useCreateDraftStore((s) => s.isCaptionFocused);
  const isDraftDirty = !!draftImage || draftCaption.trim().length > 0;

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
              const index = TAB_ORDER.indexOf(tab);
              setActiveIndex(index);
              pagerRef.current?.setPage(index);
            },
          },
        ],
      );
      return;
    }

    const index = TAB_ORDER.indexOf(tab);
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
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
        <View key="feed" style={styles.page}>
          <FeedScreen />
        </View>

        <View key="create" style={styles.page}>
          <CreateScreen />
        </View>

        <View key="challenges" style={styles.page}>
          <ChallengesScreen />
        </View>
        <View key="profile" style={styles.page}>
          <ProfileScreen />
        </View>
      </PagerView>

      <SafeAreaView edges={["bottom"]} style={styles.safeBottom}>
        <BottomTabBar activeTab={activeTab} onTabPress={goTo} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  pager: { flex: 1 },
  page: { flex: 1 },
  safeBottom: {
    backgroundColor: "#fff",
  },
});
