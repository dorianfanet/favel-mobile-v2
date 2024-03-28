import { View, PressableProps, Pressable } from "react-native";
import React from "react";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";
import { borderRadius } from "@/constants/values";

type ContainedButtonProps = PressableProps & {
  title?: string;
};

export default function ContainedButton(props: ContainedButtonProps) {
  const { onPress, title = "Save" } = props;
  return (
    <Pressable
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: borderRadius,
        backgroundColor: Colors.light.accent,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontFamily: "Outfit_600SemiBold",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
