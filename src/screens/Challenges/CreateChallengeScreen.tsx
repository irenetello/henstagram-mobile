import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Screen } from "@/src/components/Screen/Screen";
import { useAuth } from "@/src/auth/AuthProvider";
import { createChallenge } from "@/src/lib/challenges/challengeApi";
import { Timestamp } from "firebase/firestore";

export default function CreateChallengeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [endAt, setEndAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const canCreate = useMemo(() => {
    return !!user && title.trim().length >= 2 && prompt.trim().length >= 2 && !saving;
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
        startAt: startAt ? Timestamp.fromDate(startAt) : null,
        endAt: endAt ? Timestamp.fromDate(endAt) : null,
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

        <Text style={{ fontWeight: "800", marginTop: 8 }}>
          Start Date & Time (optional)
        </Text>
        <Pressable
          onPress={() => setShowStartDatePicker(true)}
          disabled={saving}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Text style={{ color: startAt ? "#000" : "#999" }}>
            {startAt ? startAt.toLocaleString() : "Select start date & time"}
          </Text>
        </Pressable>
        {startAt && (
          <Pressable onPress={() => setStartAt(null)} style={{ alignSelf: "flex-start" }}>
            <Text style={{ color: "#666", fontSize: 12 }}>Clear</Text>
          </Pressable>
        )}

        {showStartDatePicker && (
          <DateTimePicker
            value={startAt || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowStartDatePicker(false);
                setShowStartTimePicker(true);
              }
              if (selectedDate) setStartAt(selectedDate);
            }}
          />
        )}

        {showStartTimePicker && (
          <DateTimePicker
            value={startAt || new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowStartTimePicker(false);
              }
              if (selectedDate) setStartAt(selectedDate);
            }}
          />
        )}

        <Text style={{ fontWeight: "800", marginTop: 8 }}>
          End Date & Time (optional)
        </Text>
        <Pressable
          onPress={() => setShowEndDatePicker(true)}
          disabled={saving}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#f9f9f9",
          }}
        >
          <Text style={{ color: endAt ? "#000" : "#999" }}>
            {endAt ? endAt.toLocaleString() : "Select end date & time"}
          </Text>
        </Pressable>
        {endAt && (
          <Pressable onPress={() => setEndAt(null)} style={{ alignSelf: "flex-start" }}>
            <Text style={{ color: "#666", fontSize: 12 }}>Clear</Text>
          </Pressable>
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endAt || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowEndDatePicker(false);
                setShowEndTimePicker(true);
              }
              if (selectedDate) setEndAt(selectedDate);
            }}
          />
        )}

        {showEndTimePicker && (
          <DateTimePicker
            value={endAt || new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (Platform.OS !== "ios") {
                setShowEndTimePicker(false);
              }
              if (selectedDate) setEndAt(selectedDate);
            }}
          />
        )}

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
