import { View, Text } from "react-native";
import React from "react";
import { borderRadius } from "@/constants/values";

export default function MenuWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: borderRadius,
        overflow: "hidden",
        gap: 1,
        marginBottom: 10,
      }}
    >
      {children}
    </View>
  );
}
