import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  image: {
    width: "100%",
    height: 420,
  },
  captionWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  captionText: {
    color: "white",
    fontSize: 14,
    opacity: 0.92,
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
