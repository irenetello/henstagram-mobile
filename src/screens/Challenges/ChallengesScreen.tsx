import React from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallenges } from "@/src/hooks/useChallenges";
import { useCreateDraftStore } from "@/src/store/createDraftStore";

export default function ChallengesScreen() {
  const router = useRouter();
  const { items, loading } = useChallenges();
  const setChallenge = useCreateDraftStore((s) => s.setChallenge);

  const participate = (id: string, title: string) => {
    setChallenge(id, title);
    Alert.alert(
      "Challenge selected ✅",
      "Now go to the Create tab to post for this challenge.",
      [{ text: "OK" }],
    );
  };

  if (loading) {
    return (
      <Screen title="Challenges">
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Challenges">
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Pressable
          onPress={() => router.push("/challenge/create")}
          style={{
            paddingVertical: 12,
            borderRadius: 12,
            alignItems: "center",
            borderWidth: 1,
          }}
        >
          <Text style={{ fontWeight: "700" }}>+ Create challenge</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 16,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800" }}>{item.title}</Text>
            <Text style={{ marginTop: 6 }}>{item.prompt}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/challenge/[id]",
                    params: { id: item.id },
                  })
                }
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Open</Text>
              </Pressable>

              <Pressable
                onPress={() => participate(item.id, item.title)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Participate</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <Text>No active challenges yet. Create one 😈</Text>
          </View>
        }
      />
    </Screen>
  );
}
