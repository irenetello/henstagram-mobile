import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  detailWrap: { flex: 1 },
  detailHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailTitle: { fontWeight: "700", flex: 1, textAlign: "center", paddingHorizontal: 12 },
  imageWrapDetail: { position: "relative" },
  detailImage: { width: "100%", aspectRatio: 1 },

  challengePill: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "80%",
  },
  challengePillText: { color: "white", fontWeight: "700" },

  socialRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  captionText: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    lineHeight: 18,
  },
  likeBtn: { marginRight: 8 },
  countText: { fontWeight: "600", marginRight: 8 },

  commentItem: { padding: 16 },
  commentUser: { fontWeight: "600" },
  emptyText: { padding: 16, opacity: 0.6 },

  commentInputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "white",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    padding: 12,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sheetDelete: { color: "red", fontWeight: "700", fontSize: 16 },
  sheetCancel: { fontWeight: "600", fontSize: 16 },
});
