import React from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/src/components/Screen/Screen";
import { useChallenges } from "@/src/hooks/useChallenges";
import { styles } from "./ChallengesScreen.styles";

export default function ChallengesScreen() {
  const { challenges, loading } = useChallenges();

  if (loading) {
    return (
      <Screen title="Challenges">
        <ActivityIndicator style={{ marginTop: 24 }} />
      </Screen>
    );
  }

  return (
    <Screen title="Challenges">
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/challenge/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.prompt}>{item.prompt}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
