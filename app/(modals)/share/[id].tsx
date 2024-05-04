import { Touchable, View } from "react-native";
import { View as ThemedView, Text } from "@/components/Themed";
import React from "react";
import { padding } from "@/constants/values";
import { useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "@/components/Icon";
import ShareCTA from "@/app/(auth)/trip/components/ShareCTA";

export default function Share() {
  const { id } = useLocalSearchParams();

  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: padding,
        paddingTop: 80,
      }}
    ></ThemedView>
  );
}
