import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type TabKey = "feed" | "create" | "challenges" | "profile";

type Props = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

export function BottomTabBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable style={styles.item} onPress={() => onTabPress("feed")}>
        <Ionicons name={activeTab === "feed" ? "home" : "home-outline"} size={26} />
      </Pressable>

      <Pressable style={styles.item} onPress={() => onTabPress("create")}>
        <Ionicons
          name={activeTab === "create" ? "add-circle" : "add-circle-outline"}
          size={30}
        />
      </Pressable>

      <Pressable style={styles.item} onPress={() => onTabPress("challenges")}>
        <Ionicons
          name={activeTab === "challenges" ? "trophy" : "trophy-outline"}
          size={26}
        />
      </Pressable>

      <Pressable style={styles.item} onPress={() => onTabPress("profile")}>
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={26}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 62,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  item: {
    width: 64,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});
