import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },

  imageWrap: { position: "relative" },
  image: { width: "100%", height: 420 },

  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  iconBtn: { paddingVertical: 2 },
  countText: { color: "black", fontSize: 14, opacity: 0.9 },

  captionWrap: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexWrap: "wrap",
  },
  authorInline: { fontWeight: "700", fontSize: 14, marginRight: 6 },
  captionText: { fontSize: 14, opacity: 0.92 },

  challengePill: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "80%",
  },
  challengePillText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
