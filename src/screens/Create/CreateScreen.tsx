import { Screen } from "@/src/components/Screen/Screen";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useCreateDraftStore } from "@/src/store/createDraftStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth/AuthProvider";
import { styles } from "@/src/screens/Create/CreateScreen.styles";
import { publishPost } from "@/src/lib/posts/firebasePosts";

const MAX_CHARS = 140;

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, initializing } = useAuth();

  const imageUri = useCreateDraftStore((s) => s.imageUri);
  const caption = useCreateDraftStore((s) => s.caption);
  const setImageUri = useCreateDraftStore((s) => s.setImageUri);
  const setCaption = useCreateDraftStore((s) => s.setCaption);
  const setCaptionFocused = useCreateDraftStore((s) => s.setCaptionFocused);
  const resetDraft = useCreateDraftStore((s) => s.resetDraft);

  const draftChallengeId = useCreateDraftStore((s) => s.challengeId);
  const draftChallengeTitle = useCreateDraftStore((s) => s.challengeTitle);
  const setChallenge = useCreateDraftStore((s) => s.setChallenge);

  const [isPublishing, setIsPublishing] = useState(false);

  const { challengeId, challengeTitle } = useLocalSearchParams<{
    challengeId?: string;
    challengeTitle?: string;
  }>();

  useEffect(() => {
    if (challengeId) {
      setChallenge(String(challengeId), challengeTitle ? String(challengeTitle) : null);
    }
  }, [challengeId, challengeTitle, setChallenge]);

  const canPost = useMemo(() => {
    return !!user && !!imageUri && caption.trim().length > 0 && !isPublishing;
  }, [user, imageUri, caption, isPublishing]);

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

    const activeChallengeId = draftChallengeId;
    const activeChallengeTitle = draftChallengeTitle;

    try {
      const extra = activeChallengeId
        ? {
            challengeId: activeChallengeId,
            challengeTitle: activeChallengeTitle ?? undefined,
          }
        : undefined;

      await publishPost(imageUri!, caption.trim(), extra);
      resetDraft();

      if (activeChallengeId) {
        router.replace({
          pathname: "/challenge/[id]",
          params: { id: String(activeChallengeId) },
        });
      } else {
        router.replace("/(tabs)/feed");
      }
    } catch (e: any) {
      console.error("UPLOAD ERROR:", e);
      Alert.alert("Error", e?.message ?? "Failed to upload post");
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

            {/* Challenge banner (optional) */}
            {draftChallengeId ? (
              <View style={styles.challengeBanner}>
                <Text style={styles.challengeBannerText} numberOfLines={2}>
                  Posting for: {draftChallengeTitle ?? "Challenge"}
                </Text>

                <Pressable
                  onPress={() => setChallenge(null, null)}
                  disabled={isPublishing}
                  style={[styles.challengeRemoveBtn, isPublishing && styles.disabled]}
                >
                  <Text style={styles.challengeRemoveBtnText}>Remove</Text>
                </Pressable>
              </View>
            ) : null}

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
                  {initializing ? "Checking session…" : "Post"}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}
