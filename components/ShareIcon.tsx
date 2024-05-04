import { View, Text, Platform } from "react-native";
import React from "react";
import Icon from "./Icon";
import Colors from "@/constants/Colors";

export default function ShareIcon({
  size = 20,
  color = Colors.light.primary,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Icon
      icon={Platform.OS === "ios" ? "shareIOSIcon" : "shareIcon"}
      size={size}
      color={color}
    />
  );
}
