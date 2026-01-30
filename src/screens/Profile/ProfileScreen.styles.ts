import { Dimensions, StyleSheet } from "react-native";

const GAP = 2;
export const COLS = 3;

const W = Dimensions.get("window").width;
const TILE = Math.floor((W - GAP * (COLS - 1) - 24) / COLS);
// 24 = paddingHorizontal 12 + 12 del Screen

export const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  row: {
    gap: GAP,
    marginBottom: GAP,
  },

  tile: {
    width: TILE,
    height: TILE,
    marginRight: GAP,
  },

  tileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
});
