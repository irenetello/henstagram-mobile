import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    opacity: 0.95,
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
  sheetBtn: {
    paddingVertical: 12,
  },
  sheetDelete: {
    color: "red",
    fontWeight: "700",
    fontSize: 16,
  },
  sheetCancel: {
    fontWeight: "600",
    fontSize: 16,
  },
});
