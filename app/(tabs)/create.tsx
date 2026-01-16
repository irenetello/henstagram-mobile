import { Screen } from "@/components/Screen";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React from "react";

import {
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
import { useCreateDraftStore } from "../store/createDraftStore";
import { usePostsStore } from "../store/postsStore";

const MAX_CHARS = 140;

export default function CreateScreen() {
  const router = useRouter();
  const addPost = usePostsStore((s) => s.addPost);

  const imageUri = useCreateDraftStore((s) => s.imageUri);
  const caption = useCreateDraftStore((s) => s.caption);
  const setImageUri = useCreateDraftStore((s) => s.setImageUri);
  const setCaption = useCreateDraftStore((s) => s.setCaption);
  const setCaptionFocused = useCreateDraftStore((s) => s.setCaptionFocused);
  const resetDraft = useCreateDraftStore((s) => s.resetDraft);

  const canPost = !!imageUri && caption.trim().length > 0;

  const pickImage = async () => {
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

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const publish = () => {
    if (!canPost) return;

    addPost({ imageUrl: imageUri, caption });
    resetDraft();

    router.replace("/(tabs)/feed");
  };

  return (
    <Screen title="Create">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90} // ajustable si ves que aún tapa
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Create memory ➕</Text>

            <Pressable onPress={pickImage} style={styles.pickBtn}>
              <Text style={styles.pickBtnText}>
                {imageUri ? "Change photo" : "Pick a photo"}
              </Text>
            </Pressable>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
            {imageUri && (
              <View style={styles.photoActions}>
                <Pressable onPress={() => setImageUri(null)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Remove</Text>
                </Pressable>

                <Pressable onPress={pickImage} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Choose another</Text>
                </Pressable>
              </View>
            )}

            <TextInput
              value={caption}
              onChangeText={(text) => setCaption(text.slice(0, MAX_CHARS))}
              onFocus={() => setCaptionFocused(true)}
              onBlur={() => setCaptionFocused(false)}
              placeholder="Write a caption…"
              style={styles.input}
              multiline
            />
            <Text style={styles.counter}>
              {caption.length} / {MAX_CHARS}
            </Text>
            <Pressable
              onPress={publish}
              disabled={!canPost}
              style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
            >
              <Text style={styles.postBtnText}>Post</Text>
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

  preview: { width: "100%", aspectRatio: 1, borderRadius: 16, backgroundColor: "#ddd" },

  input: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },

  counter: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#666",
    marginTop: -4,
  },

  postBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnDisabled: { opacity: 0.6 },
  postBtnText: { color: "#fff", fontWeight: "800" },

  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontWeight: "700",
  },
});
