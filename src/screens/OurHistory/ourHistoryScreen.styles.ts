import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 24 },

  cardWrap: { minHeight: 80, position: "relative" },
  line: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: "#E5E7EB",
  },
  dot: {
    position: "absolute",
    left: "50%",
    top: 18,
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: 999,
    backgroundColor: "#111827",
  },

  card: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
  },
  left: { alignSelf: "flex-start" },
  right: { alignSelf: "flex-end" },

  date: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
  title: { fontSize: 15, fontWeight: "800", marginTop: 6 },
  caption: { fontSize: 13, color: "#374151", marginTop: 6 },

  image: { height: 180, borderRadius: 12, marginTop: 10 },

  finalWrap: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },
  finalTitle: { fontSize: 16, fontWeight: "900" },
  finalBody: { marginTop: 10, fontSize: 13, color: "#374151", lineHeight: 18 },

  center: { padding: 16, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyText: { fontSize: 13, color: "#6B7280" },

  errorTitle: { fontSize: 16, fontWeight: "900" },
  errorText: { fontSize: 13, color: "#B91C1C" },
  errorHint: { fontSize: 12, color: "#6B7280" },
});
