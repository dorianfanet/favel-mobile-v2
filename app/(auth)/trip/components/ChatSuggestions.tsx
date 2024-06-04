import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { borderRadius, padding } from "@/constants/values";
import { FlatList } from "react-native-gesture-handler";

export default function ChatSuggestions({
  data,
  onPress,
}: {
  data: string[];
  onPress: (item: string) => void;
}) {
  return (
    <View
      style={{
        height: 50,
      }}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPress(item)}
            style={{
              padding: 10,
              margin: 5,
              backgroundColor: "#1C344B",
              borderRadius: borderRadius,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white" }}>{item}</Text>
          </TouchableOpacity>
        )}
        horizontal
        contentContainerStyle={{
          paddingLeft: padding,
        }}
      />
    </View>
  );
}
