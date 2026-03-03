import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#f2f2f2",
  },
  tabActive: {
    backgroundColor: "#111",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 14,
  },
  emptyWrap: {
    padding: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
