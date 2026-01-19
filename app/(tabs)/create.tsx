import { Screen } from "@/components/Screen";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { publishPost } from "@/src/lib/firebasePosts";
import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { useCreateDraftStore } from "@/src/store/createDraftStore";
import { auth } from "@/src/lib/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CHARS = 140;

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const imageUri = useCreateDraftStore((s) => s.imageUri);
  const caption = useCreateDraftStore((s) => s.caption);
  const setImageUri = useCreateDraftStore((s) => s.setImageUri);
  const setCaption = useCreateDraftStore((s) => s.setCaption);
  const setCaptionFocused = useCreateDraftStore((s) => s.setCaptionFocused);
  const resetDraft = useCreateDraftStore((s) => s.resetDraft);

  const [authReady, setAuthReady] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setAuthReady(!!user));
    return unsub;
  }, []);

  const canPost = useMemo(() => {
    return authReady && !!imageUri && caption.trim().length > 0 && !isPublishing;
  }, [authReady, imageUri, caption, isPublishing]);

  const pickImage = async () => {
    if (isPublishing) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "We need access to your photos to post a memory.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const publish = async () => {
    if (!canPost) return;

    setIsPublishing(true);
    try {
      await publishPost(imageUri!, caption.trim());
      resetDraft();
      router.replace("/(tabs)/feed");
    } catch (e) {
      console.error("UPLOAD ERROR:", e);
      Alert.alert("Error", "Failed to upload post");
      setIsPublishing(false);
    }
  };

  return (
    <Screen title="Create">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Create memory ➕</Text>

            <Pressable
              onPress={pickImage}
              disabled={isPublishing}
              style={[styles.pickBtn, isPublishing && styles.disabled]}
            >
              <Text style={styles.pickBtnText}>
                {imageUri ? "Change photo" : "Pick a photo"}
              </Text>
            </Pressable>

            {imageUri && (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.preview} />

                {isPublishing && (
                  <View style={styles.overlay}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.overlayText}>Uploading…</Text>
                  </View>
                )}
              </View>
            )}

            {imageUri && (
              <View style={styles.photoActions}>
                <Pressable
                  onPress={() => setImageUri(null)}
                  disabled={isPublishing}
                  style={[styles.secondaryBtn, isPublishing && styles.disabled]}
                >
                  <Text style={styles.secondaryBtnText}>Remove</Text>
                </Pressable>

                <Pressable
                  onPress={pickImage}
                  disabled={isPublishing}
                  style={[styles.secondaryBtn, isPublishing && styles.disabled]}
                >
                  <Text style={styles.secondaryBtnText}>Choose another</Text>
                </Pressable>
              </View>
            )}

            <TextInput
              value={caption}
              editable={!isPublishing}
              onChangeText={(text) => setCaption(text.slice(0, MAX_CHARS))}
              onFocus={() => setCaptionFocused(true)}
              onBlur={() => setCaptionFocused(false)}
              placeholder="Write a caption…"
              style={[styles.input, isPublishing && styles.inputDisabled]}
              multiline
            />

            <Text style={styles.counter}>
              {caption.length} / {MAX_CHARS}
            </Text>

            <Pressable
              onPress={publish}
              disabled={!canPost}
              style={[
                styles.postBtn,
                (!canPost || isPublishing) && styles.postBtnDisabled,
              ]}
            >
              {isPublishing ? (
                <View style={styles.postBtnRow}>
                  <ActivityIndicator />
                  <Text style={styles.postBtnText}>Posting…</Text>
                </View>
              ) : (
                <Text style={styles.postBtnText}>
                  {!authReady ? "Checking session…" : "Post"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
});
