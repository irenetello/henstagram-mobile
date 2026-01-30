import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 20, fontWeight: "700" },

  pickBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  pickBtnText: { fontWeight: "700" },

  previewWrap: { width: "100%", borderRadius: 16, overflow: "hidden" },
  preview: { width: "100%", aspectRatio: 1, backgroundColor: "#ddd" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  overlayText: { color: "#111", fontWeight: "800" },

  input: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputDisabled: { opacity: 0.7 },

  counter: { alignSelf: "flex-end", fontSize: 12, color: "#666", marginTop: -4 },

  postBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: { opacity: 0.6 },
  postBtnText: { color: "#fff", fontWeight: "800" },

  postBtnRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  photoActions: { flexDirection: "row", gap: 10 },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontWeight: "700" },

  disabled: { opacity: 0.6 },
  challengeBanner: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  challengeBannerText: { flex: 1, fontWeight: "700" },
  challengeRemoveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  challengeRemoveBtnText: { fontWeight: "800" },
  pickRow: {
    flexDirection: "row",
    gap: 10,
  },

  pickBtnHalf: {
    flex: 1,
  },
});
