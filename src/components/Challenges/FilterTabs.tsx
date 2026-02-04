import React from "react";
import { View, Pressable, Text } from "react-native";
import { styles } from "../../screens/Challenges/ChallengesScreen.styles";

interface FilterTabsProps {
  filters: Array<{ label: string; value: string }>;
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function FilterTabs({ filters, activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <View style={styles.filterTabs}>
      {filters.map((filter) => (
        <Pressable
          key={filter.value}
          onPress={() => onFilterChange(filter.value)}
          style={[
            styles.filterTab,
            activeFilter === filter.value && styles.filterTabActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.value && styles.filterTabTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
