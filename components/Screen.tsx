import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    width: 80, // reserva espacio para centrar el título aunque haya botón a la derecha
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
});
