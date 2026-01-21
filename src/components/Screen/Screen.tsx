import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./Screen.styles";

type ScreenProps = {
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
};

export function Screen({
  title = "Henstagram",
  children,
  headerRight,
  headerLeft,
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.side}>{headerLeft}</View>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>

          <View style={[styles.side, styles.sideRight]}>{headerRight}</View>
        </View>
      </View>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}
