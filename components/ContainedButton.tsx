import {
  View,
  Pressable,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React from "react";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";
import { borderRadius } from "@/constants/values";

type ContainedButtonProps = TouchableOpacityProps & {
  title?: string;
  onPress: () => void;
};

export default function ContainedButton(props: ContainedButtonProps) {
  const { onPress, title = "Save", style, ...otherProps } = props;

  return (
    <TouchableOpacity
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: borderRadius,
          backgroundColor: Colors.light.accent,
        },
        style,
      ]}
      onPress={onPress}
      {...otherProps}
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
    </TouchableOpacity>
  );
}
