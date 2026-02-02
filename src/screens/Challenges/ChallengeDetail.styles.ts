import { Dimensions, StyleSheet } from "react-native";

export const COLS = 3;
const GAP = 2;
const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 32) / COLS); // 32 = padding 16 + 16

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerCard: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  prompt: {
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.9,
    backgroundColor: "#eee",
  },
  countdown: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  metaText: {
    fontSize: 12,
    opacity: 0.8,
  },

  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#6575AC",
  },
  toggleText: {
    fontWeight: "700",
    opacity: 0.9,
  },
  toggleTextActive: {
    color: "#fff",
  },

  participateButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    opacity: 0.95,
    backgroundColor: "#6575AC",
  },
  participateButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  // Grid (Profile)
  gridList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  tile: {
    width: TILE,
    height: TILE,
    backgroundColor: "#eee",
  },
  img: {
    width: "100%",
    height: "100%",
  },

  // Feed
  feedList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  emptyText: {
    paddingHorizontal: 16,
    paddingTop: 24,
    opacity: 0.8,
  },
  errorText: {
    paddingHorizontal: 16,
    paddingTop: 24,
    opacity: 0.9,
  },
});
