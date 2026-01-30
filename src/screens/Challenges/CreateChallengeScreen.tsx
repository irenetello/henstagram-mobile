import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useAuth } from "@/src/auth/AuthProvider";
import { createChallenge } from "@/src/lib/challenges/challengeApi";

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreate = useMemo(() => {
    return !!user && title.trim().length >= 3 && prompt.trim().length >= 5 && !saving;
  }, [user, title, prompt, saving]);

  const onCreate = async () => {
    if (!canCreate || !user) return;

    setSaving(true);
    try {
      await createChallenge({
        title: title.trim(),
        prompt: prompt.trim(),
        createdByUid: user.uid,
        createdByName: user.email ?? undefined,
      });

      Alert.alert("Done ✅", "Challenge created.");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not create challenge");
      setSaving(false);
    }
  };

  return (
    <Screen title="Create challenge">
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontWeight: "800" }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Golden Hour"
          editable={!saving}
          style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}
        />

        <Text style={{ fontWeight: "800" }}>Prompt</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Upload a photo with golden light"
          editable={!saving}
          multiline
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 80 }}
        />

        <Text style={{ color: "#666" }}>
          This creates a draft. An admin can later activate it (set start/end).
        </Text>

        <Pressable
          onPress={onCreate}
          disabled={!canCreate}
          style={{
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
            opacity: canCreate ? 1 : 0.5,
            marginTop: 10,
          }}
        >
          {saving ? (
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ fontWeight: "800" }}>Creating…</Text>
            </View>
          ) : (
            <Text style={{ fontWeight: "800" }}>Create</Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}
