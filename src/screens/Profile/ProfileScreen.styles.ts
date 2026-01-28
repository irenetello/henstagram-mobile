import { StyleSheet, Dimensions } from "react-native";

const GAP = 2;
export const COLS = 3;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);
// 24 = paddingHorizontal 12 + 12

export const styles = StyleSheet.create({
  /* ===== GRID ===== */
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    gap: GAP,
  },
  tile: {
    width: TILE,
    height: TILE,
    marginBottom: GAP,
    backgroundColor: "#eee",
  },
  img: {
    width: "100%",
    height: "100%",
  },

  /* ===== HEADER ===== */
  logoutText: {
    color: "#000",
    fontWeight: "600",
    paddingRight: 12,
  },

  /* ===== MODAL DETAIL ===== */
  detailWrap: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  detailImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#000",
  },

  /* ===== CAPTION ===== */
  captionWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  displayName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 18,
  },

  /* ===== COMMENTS INPUT ===== */
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },

  /* ===== ACTION SHEET ===== */
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetDelete: {
    color: "red",
    fontWeight: "600",
    paddingVertical: 12,
    textAlign: "center",
  },
  sheetCancel: {
    fontWeight: "600",
    paddingVertical: 12,
    textAlign: "center",
  },
  // ✅ Wrapper para GRID (necesita ocupar todo el tile)
  imageWrapGrid: {
    position: "relative",
    width: "100%",
    height: "100%",
  },

  // ✅ Wrapper para MODAL (NO puede tener height 100%)
  imageWrapDetail: {
    position: "relative",
    width: "100%",
  },

  // Pill grande (modal detalle)
  challengePill: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: "90%",
  },
  challengePillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Pill pequeña (grid)
  challengePillSmall: {
    position: "absolute",
    top: 6,
    left: 6,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: "92%",
  },
  challengePillSmallText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
