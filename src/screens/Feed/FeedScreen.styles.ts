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
    backgroundColor: "#FFFFFF",
  },

  image: {
    width: "100%",
    height: 420,
  },
  captionWrap: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  displayName: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 4,
    marginRight: 6,
  },
  captionText: {
    color: "black",
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
  likesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  likeBtn: {
    paddingVertical: 2,
  },
  likesText: {
    color: "black",
    fontSize: 14,
    opacity: 0.9,
  },

  // ✅ Banner Challenge (Feed principal)
  imageWrap: {
    position: "relative",
  },

  // 🏷️ Pill overlay (Challenge)
  challengePill: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,

    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  challengePillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
