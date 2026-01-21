import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    width: 80, // reserva espacio para centrar el título aunque haya botón a la derecha
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
});
