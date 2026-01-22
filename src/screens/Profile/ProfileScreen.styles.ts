// ProfileScreen.styles.ts
import { StyleSheet, Dimensions } from "react-native";

const GAP = 2;
export const COLS = 3;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);

export const styles = StyleSheet.create({
  logoutText: {
    fontWeight: "800",
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  img: {
    width: "100%",
    height: "100%",
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
  // ✅ modal detalle
  detailWrap: {
    flex: 1,
    backgroundColor: "white",
  },
  detailHeader: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  detailTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
  },
  detailImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#111",
  },

  // ✅ action sheet
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
  sheetBtn: {
    paddingVertical: 12,
  },
  sheetDelete: {
    color: "red",
    fontWeight: "800",
    fontSize: 16,
  },
  sheetCancel: {
    fontWeight: "700",
    fontSize: 16,
  },
});
