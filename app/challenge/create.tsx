import React from "react";
import { View, Text } from "react-native";
import { Screen } from "@/src/components/Screen/Screen";

export default function CreateChallengeScreen() {
  return (
    <Screen title="Create Challenge">
      <View style={{ padding: 16 }}>
        <Text>Create challenge form goes here</Text>
      </View>
    </Screen>
  );
}
